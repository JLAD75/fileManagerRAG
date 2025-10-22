export interface User {
  id: string
  email: string
  name: string
  createdAt: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials {
  name: string
  email: string
  password: string
}

export interface AuthResponse {
  token: string
  user: User
}

export interface FileItem {
  id: string
  name: string
  originalName: string
  size: number
  mimeType: string
  uploadedAt: string
  userId: string
  isProcessed: boolean
  path: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  sources?: string[]
}

export interface ChatRequest {
  message: string
  userId: string
}

export interface ChatResponse {
  message: string
  sources: Array<{
    fileName: string
    content: string
    score: number
  }>
}
