import { Response } from 'express'
import { UploadedFile } from 'express-fileupload'
import { File } from '../models/File'
import { AuthRequest } from '../types'
import { DocumentProcessor } from '../services/documentProcessor'
import { VectorStoreService } from '../services/vectorStore'
import fs from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

const documentProcessor = new DocumentProcessor()
const vectorStore = VectorStoreService.getInstance()

export const uploadFile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({ message: 'No file uploaded' })
    }

    const uploadedFile = req.files.file as UploadedFile

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ]

    if (!allowedTypes.includes(uploadedFile.mimetype)) {
      return res.status(400).json({ message: 'Invalid file type' })
    }

    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'uploads')
    try {
      await fs.access(uploadDir)
    } catch {
      await fs.mkdir(uploadDir, { recursive: true })
    }

    // Generate unique filename
    const uniqueName = `${uuidv4()}${path.extname(uploadedFile.name)}`
    const filePath = path.join(uploadDir, uniqueName)

    // Move file to uploads directory
    await uploadedFile.mv(filePath)

    const file = new File({
      userId: req.user!.userId,
      name: uniqueName,
      originalName: uploadedFile.name,
      size: uploadedFile.size,
      mimeType: uploadedFile.mimetype,
      path: filePath,
      isProcessed: false,
    })

    await file.save()

    // Process file asynchronously
    processFileAsync(file._id.toString(), filePath, req.user!.userId)

    res.status(201).json(file)
  } catch (error) {
    console.error('Upload error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

async function processFileAsync(fileId: string, filePath: string, userId: string) {
  try {
    const text = await documentProcessor.processFile(filePath)
    const chunks = documentProcessor.chunkText(text, fileId)

    await vectorStore.addDocuments(chunks, userId)

    await File.findByIdAndUpdate(fileId, { isProcessed: true })
    console.log(`File ${fileId} processed successfully`)
  } catch (error) {
    console.error(`Error processing file ${fileId}:`, error)
  }
}

export const getFiles = async (req: AuthRequest, res: Response) => {
  try {
    const files = await File.find({ userId: req.user!.userId }).sort({ uploadedAt: -1 })
    res.json(files)
  } catch (error) {
    console.error('Get files error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

export const deleteFile = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params

    const file = await File.findOne({ _id: id, userId: req.user!.userId })

    if (!file) {
      return res.status(404).json({ message: 'File not found' })
    }

    // Delete physical file
    try {
      await fs.unlink(file.path)
    } catch (error) {
      console.error('Error deleting physical file:', error)
    }

    // Delete from database
    await File.findByIdAndDelete(id)

    // Delete from vector store
    await vectorStore.deleteDocumentsByFileId(id, req.user!.userId)

    res.json({ message: 'File deleted successfully' })
  } catch (error) {
    console.error('Delete file error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}
