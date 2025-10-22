import { ChatOpenAI } from '@langchain/openai'
import { VectorDocument } from '../types'

export class ChatService {
  private llm: ChatOpenAI

  constructor() {
    console.log('Initializing ChatService with OpenAI model...')
    console.log('Using OpenAI API Key:', process.env.OPENAI_API_KEY ? 'Provided' : 'Not Provided')
    this.llm = new ChatOpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: 'gpt-4o-mini',
      temperature: 0.7,
    })
  }

  async generateResponse(
    query: string,
    relevantDocs: VectorDocument[],
    modelName?: string
  ): Promise<string> {
    // Use provided model or fall back to default
    const selectedModel = modelName || 'gpt-4o-mini';
    
    // Create a new LLM instance with the selected model
    const llm = new ChatOpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: selectedModel,
      temperature: selectedModel.includes("mini") ? 1 : 0.7,
    });

    // Dynamically calculate max context based on model capabilities
    // Rule: ~4 characters = 1 token, keeping 50% for context (rest for response)
    let maxTokens = 8192; // Default for GPT-4 base
    
    if (selectedModel.startsWith('gpt-5')) {
      maxTokens = 400000; // GPT-5 models
    } else if (selectedModel.includes('gpt-4o') || selectedModel.includes('gpt-4-turbo')) {
      maxTokens = 128000; // GPT-4o and GPT-4 Turbo
    } else if (selectedModel.includes('gpt-3.5-turbo')) {
      maxTokens = 16385; // GPT-3.5 Turbo
    }
    
    // Use 50% for context input, convert tokens to characters (~4 chars per token)
    const maxContextLength = Math.floor((maxTokens * 0.5) * 4);
    let currentLength = 0;
    const limitedDocs: VectorDocument[] = [];

    for (const doc of relevantDocs) {
      const docLength = doc.pageContent.length;
      if (currentLength + docLength <= maxContextLength) {
        limitedDocs.push(doc);
        currentLength += docLength;
      } else {
        // Add partial document if there's space
        const remainingSpace = maxContextLength - currentLength;
        if (remainingSpace > 500) {
          limitedDocs.push({
            ...doc,
            pageContent: doc.pageContent.substring(0, remainingSpace),
          });
        }
        break;
      }
    }

    // Détecter le nombre de fichiers sources uniques
    const uniqueFiles = new Set(limitedDocs.map(doc => doc.metadata.fileId));
    const uniqueFileCount = uniqueFiles.size;
    
    // Adapter le prompt selon qu'il y a un seul ou plusieurs documents
    let contextLabel: string;
    let sourceInstructions: string;
    
    if (uniqueFileCount === 1) {
      // Un seul document, mentionner les sections
      contextLabel = limitedDocs
        .map((doc, idx) => `Section ${idx + 1}:\n${doc.pageContent}`)
        .join('\n\n');
      sourceInstructions = `- Si tu cites des informations, mentionne "d'après les sections du document" ou "selon différentes sections du document"
- Ne mentionne PAS "Document 1, 2, 3" car il s'agit de sections d'un même document`;
    } else {
      // Plusieurs documents, mentionner les documents
      contextLabel = limitedDocs
        .map((doc, idx) => `Document ${idx + 1} (${doc.metadata.fileName}):\n${doc.pageContent}`)
        .join('\n\n');
      sourceInstructions = `- Si tu cites des informations, mentionne les documents sources (exemple: "d'après le document X")
- Tu peux référencer plusieurs documents si nécessaire`;
    }

    const context = contextLabel;

    const prompt = `Tu es un assistant IA spécialisé dans l'analyse de documents. Réponds à la question de l'utilisateur en te basant uniquement sur les documents fournis ci-dessous.

Informations disponibles:
${context}

Question de l'utilisateur: ${query}

Instructions:
- Réponds de manière claire et concise
- Base ta réponse uniquement sur les informations contenues dans les documents
- Si l'information n'est pas présente dans les documents, dis-le clairement
${sourceInstructions}

Réponse:`;

    try {
      const response = await llm.invoke(prompt);
      return response.content as string;
    } catch (error) {
      console.error("LLM error:", error);
      throw new Error("Failed to generate response");
    }
  }
}
