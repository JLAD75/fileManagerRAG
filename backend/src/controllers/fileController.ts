import { Response } from 'express'
import { File } from '../models/File'
import { AuthRequest } from '../types'
import { DocumentProcessor } from '../services/documentProcessor'
import { VectorStoreService } from '../services/vectorStore'
import fs from 'fs/promises'

const documentProcessor = new DocumentProcessor()
const vectorStore = VectorStoreService.getInstance()

export const uploadFile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' })
    }

    const file = new File({
      userId: req.user!.userId,
      name: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimeType: req.file.mimetype,
      path: req.file.path,
      isProcessed: false,
    })

    await file.save()

    // Process file asynchronously
    processFileAsync(file._id.toString(), req.file.path, req.user!.userId)

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
