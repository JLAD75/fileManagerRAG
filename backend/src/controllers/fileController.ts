import { Response } from "express";
import { UploadedFile } from "express-fileupload";
import fs from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { File } from "../models/File";
import { DocumentProcessor } from "../services/documentProcessor";
import { VectorStoreService } from "../services/vectorStore";
import { AuthRequest } from "../types";

const documentProcessor = new DocumentProcessor();

// Lazy initialization to ensure env vars are loaded
let vectorStore: VectorStoreService | null = null;
const getVectorStore = () => {
  if (!vectorStore) {
    vectorStore = VectorStoreService.getInstance();
  }
  return vectorStore;
};

export const uploadFile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const uploadedFile = req.files.file as UploadedFile;

    // Fix encoding issue with filename (UTF-8 -> Latin1 -> UTF-8)
    const fixedFileName = Buffer.from(uploadedFile.name, "latin1").toString(
      "utf8"
    );

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "text/csv",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];

    if (!allowedTypes.includes(uploadedFile.mimetype)) {
      return res.status(400).json({ message: "Invalid file type" });
    }

    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), "uploads");
    try {
      await fs.access(uploadDir);
    } catch {
      await fs.mkdir(uploadDir, { recursive: true });
    }

    // Generate unique filename (using fixed encoding)
    const uniqueName = `${uuidv4()}${path.extname(fixedFileName)}`;
    const filePath = path.join(uploadDir, uniqueName);

    // Move file to uploads directory
    await uploadedFile.mv(filePath);

    const file = new File({
      userId: req.user!.userId,
      name: uniqueName,
      originalName: fixedFileName,
      size: uploadedFile.size,
      mimeType: uploadedFile.mimetype,
      path: filePath,
      isProcessed: false,
    });

    await file.save();

    // Process file asynchronously (using fixed filename)
    processFileAsync(
      (file._id as any).toString(),
      filePath,
      req.user!.userId,
      fixedFileName
    );

    // Transform response to match frontend expectations
    const responseFile = {
      id: (file._id as any).toString(),
      name: file.name,
      originalName: file.originalName,
      size: file.size,
      mimeType: file.mimeType,
      path: file.path,
      isProcessed: file.isProcessed,
      userId: file.userId.toString(),
      uploadedAt: file.uploadedAt,
    };

    res.status(201).json(responseFile);
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

async function processFileAsync(
  fileId: string,
  filePath: string,
  userId: string,
  originalFileName: string
) {
  try {
    const text = await documentProcessor.processFile(filePath);
    const chunks = documentProcessor.chunkText(text, fileId, originalFileName);

    await getVectorStore().addDocuments(chunks, userId);

    await File.findByIdAndUpdate(fileId, { isProcessed: true });
    console.log(`File ${fileId} processed successfully`);
  } catch (error) {
    console.error(`Error processing file ${fileId}:`, error);
  }
}

export const getFiles = async (req: AuthRequest, res: Response) => {
  try {
    const files = await File.find({ userId: req.user!.userId }).sort({
      uploadedAt: -1,
    });

    // Transform response to match frontend expectations
    const responseFiles = files.map((file) => ({
      id: (file._id as any).toString(),
      name: file.name,
      originalName: file.originalName,
      size: file.size,
      mimeType: file.mimeType,
      path: file.path,
      isProcessed: file.isProcessed,
      userId: file.userId.toString(),
      uploadedAt: file.uploadedAt,
    }));

    res.json(responseFiles);
  } catch (error) {
    console.error("Get files error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getFileStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Validate ID format
    if (!id || id === "undefined") {
      return res.status(400).json({ message: "Invalid file ID" });
    }

    const file = await File.findOne({ _id: id, userId: req.user!.userId });

    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    // Transform response to match frontend expectations
    const responseFile = {
      id: (file._id as any).toString(),
      name: file.name,
      originalName: file.originalName,
      size: file.size,
      mimeType: file.mimeType,
      path: file.path,
      isProcessed: file.isProcessed,
      userId: file.userId.toString(),
      uploadedAt: file.uploadedAt,
    };

    res.json(responseFile);
  } catch (error) {
    console.error("Get file status error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const downloadFile = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Validate ID format
    if (!id || id === "undefined") {
      return res.status(400).json({ message: "Invalid file ID" });
    }

    const file = await File.findOne({ _id: id, userId: req.user!.userId });

    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    // Check if file exists
    try {
      await fs.access(file.path);
    } catch {
      return res.status(404).json({ message: "File not found on disk" });
    }

    // Set appropriate headers
    res.setHeader("Content-Type", file.mimeType);
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${encodeURIComponent(file.originalName)}"`
    );

    // Read and send file
    const fileBuffer = await fs.readFile(file.path);
    res.send(fileBuffer);
  } catch (error) {
    console.error("Download file error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteFile = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Validate ID format
    if (!id || id === "undefined") {
      return res.status(400).json({ message: "Invalid file ID" });
    }

    const file = await File.findOne({ _id: id, userId: req.user!.userId });

    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    // Delete physical file
    try {
      await fs.unlink(file.path);
    } catch (error) {
      console.error("Error deleting physical file:", error);
    }

    // Delete from database
    await File.findByIdAndDelete(id);

    // Delete from vector store
    await getVectorStore().deleteDocumentsByFileId(id, req.user!.userId);

    res.json({ message: "File deleted successfully" });
  } catch (error) {
    console.error("Delete file error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
