import { Response } from 'express'
import { AuthRequest } from '../types'
import { VectorStoreService } from '../services/vectorStore'
import { ChatService } from '../services/chatService'

const vectorStore = VectorStoreService.getInstance()
const chatService = new ChatService()

export const chat = async (req: AuthRequest, res: Response) => {
  try {
    const { message } = req.body

    if (!message) {
      return res.status(400).json({ message: 'Message is required' })
    }

    const userId = req.user!.userId

    // Retrieve relevant documents
    const relevantDocs = await vectorStore.similaritySearch(message, userId, 3)

    if (relevantDocs.length === 0) {
      return res.json({
        message: 'Je n\'ai trouvé aucun document pertinent pour répondre à votre question. Veuillez d\'abord télécharger des documents.',
        sources: [],
      })
    }

    // Generate response using AI
    const response = await chatService.generateResponse(message, relevantDocs)

    const sources = relevantDocs.map((doc) => ({
      fileName: doc.metadata.fileName,
      content: doc.pageContent.substring(0, 200) + '...',
      score: 0,
    }))

    res.json({
      message: response,
      sources,
    })
  } catch (error) {
    console.error('Chat error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}
