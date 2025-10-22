import { ChatOpenAI } from '@langchain/openai'
import { VectorDocument } from '../types'

export class ChatService {
  private llm: ChatOpenAI

  constructor() {
    this.llm = new ChatOpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: 'gpt-4o-mini',
      temperature: 0.7,
    })
  }

  async generateResponse(
    query: string,
    relevantDocs: VectorDocument[]
  ): Promise<string> {
    const context = relevantDocs
      .map((doc, idx) => `Document ${idx + 1}:\n${doc.pageContent}`)
      .join('\n\n')

    const prompt = `Tu es un assistant IA spécialisé dans l'analyse de documents. Réponds à la question de l'utilisateur en te basant uniquement sur les documents fournis ci-dessous.

Documents disponibles:
${context}

Question de l'utilisateur: ${query}

Instructions:
- Réponds de manière claire et concise
- Base ta réponse uniquement sur les informations contenues dans les documents
- Si l'information n'est pas présente dans les documents, dis-le clairement
- Cite les sources lorsque c'est pertinent

Réponse:`

    try {
      const response = await this.llm.invoke(prompt)
      return response.content as string
    } catch (error) {
      console.error('LLM error:', error)
      throw new Error('Failed to generate response')
    }
  }
}
