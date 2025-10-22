import { FaissStore } from '@langchain/community/vectorstores/faiss'
import { OpenAIEmbeddings } from '@langchain/openai'
import { Document } from 'langchain/document'
import { DocumentChunk, VectorDocument } from '../types'
import path from 'path'
import fs from 'fs'

export class VectorStoreService {
  private static instance: VectorStoreService
  private stores: Map<string, FaissStore> = new Map()
  private embeddings: OpenAIEmbeddings
  private storeDir: string

  private constructor() {
    this.embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
    })
    this.storeDir = path.join(process.cwd(), 'vector_stores')

    if (!fs.existsSync(this.storeDir)) {
      fs.mkdirSync(this.storeDir, { recursive: true })
    }
  }

  static getInstance(): VectorStoreService {
    if (!VectorStoreService.instance) {
      VectorStoreService.instance = new VectorStoreService()
    }
    return VectorStoreService.instance
  }

  private async getOrCreateStore(userId: string): Promise<FaissStore> {
    if (this.stores.has(userId)) {
      return this.stores.get(userId)!
    }

    const storePath = path.join(this.storeDir, userId)

    try {
      if (fs.existsSync(storePath)) {
        const store = await FaissStore.load(storePath, this.embeddings)
        this.stores.set(userId, store)
        return store
      }
    } catch (error) {
      console.log(`Creating new vector store for user ${userId}`)
    }

    const store = await FaissStore.fromDocuments(
      [new Document({ pageContent: 'Initialization document', metadata: {} })],
      this.embeddings
    )

    this.stores.set(userId, store)
    return store
  }

  async addDocuments(chunks: DocumentChunk[], userId: string): Promise<void> {
    const store = await this.getOrCreateStore(userId)

    const documents = chunks.map(
      (chunk) =>
        new Document({
          pageContent: chunk.content,
          metadata: {
            fileId: chunk.metadata.fileId,
            fileName: chunk.metadata.fileName,
            chunkIndex: chunk.metadata.chunkIndex,
          },
        })
    )

    await store.addDocuments(documents)

    const storePath = path.join(this.storeDir, userId)
    await store.save(storePath)

    console.log(`Added ${chunks.length} chunks for user ${userId}`)
  }

  async similaritySearch(
    query: string,
    userId: string,
    k = 3
  ): Promise<VectorDocument[]> {
    try {
      const store = await this.getOrCreateStore(userId)
      const results = await store.similaritySearch(query, k)

      return results
        .filter((doc) => doc.pageContent !== 'Initialization document')
        .map((doc) => ({
          pageContent: doc.pageContent,
          metadata: {
            fileId: doc.metadata.fileId,
            fileName: doc.metadata.fileName,
            chunkIndex: doc.metadata.chunkIndex,
          },
        }))
    } catch (error) {
      console.error('Similarity search error:', error)
      return []
    }
  }

  async deleteDocumentsByFileId(fileId: string, userId: string): Promise<void> {
    try {
      const store = await this.getOrCreateStore(userId)

      // Note: FAISS doesn't support direct deletion, so we'd need to rebuild the index
      // For now, we'll just log this. A full implementation would recreate the store
      // without the deleted file's documents
      console.log(`Deletion requested for file ${fileId} (not fully implemented)`)

    } catch (error) {
      console.error('Delete documents error:', error)
    }
  }
}
