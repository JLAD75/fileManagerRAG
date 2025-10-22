import { Request } from 'express'

export interface AuthRequest extends Request {
  user?: {
    userId: string
    email: string
  }
}

export interface DocumentChunk {
  content: string
  metadata: {
    fileId: string
    fileName: string
    chunkIndex: number
    totalChunks: number
  }
}

export interface VectorDocument {
  pageContent: string
  metadata: {
    fileId: string
    fileName: string
    chunkIndex: number
  }
}
