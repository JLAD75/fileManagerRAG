import { HNSWLib } from '@langchain/community/vectorstores/hnswlib'
import { OpenAIEmbeddings } from '@langchain/openai'
import { Document } from '@langchain/core/documents'
import { DocumentChunk, VectorDocument } from '../types'
import path from 'path'
import fs from 'fs'

export class VectorStoreService {
  private static instance: VectorStoreService
  private stores: Map<string, HNSWLib> = new Map()
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

  private async getOrCreateStore(userId: string): Promise<HNSWLib> {
    if (this.stores.has(userId)) {
      return this.stores.get(userId)!
    }

    const storePath = path.join(this.storeDir, userId)

    try {
      if (fs.existsSync(storePath)) {
        const store = await HNSWLib.load(storePath, this.embeddings)
        this.stores.set(userId, store)
        return store
      }
    } catch (error) {
      console.log(`Creating new vector store for user ${userId}`)
    }

    const store = await HNSWLib.fromDocuments(
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
      // HNSWLib doesn't support direct deletion, so we need to rebuild the store
      // For now, we'll just log this. A full implementation would:
      // 1. Load all documents
      // 2. Filter out the ones with matching fileId
      // 3. Create a new store with the remaining documents
      console.log(`Deletion requested for file ${fileId} - requires store rebuild`)
    } catch (error) {
      console.error('Delete documents error:', error)
    }
  }
}
