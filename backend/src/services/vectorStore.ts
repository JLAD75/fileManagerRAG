import { HNSWLib } from '@langchain/community/vectorstores/hnswlib'
import { Document } from "@langchain/core/documents";
import { OpenAIEmbeddings } from "@langchain/openai";
import fs from "fs";
import path from "path";
import { DocumentChunk, VectorDocument } from "../types";

export class VectorStoreService {
  private static instance: VectorStoreService;
  private stores: Map<string, HNSWLib> = new Map();
  private embeddings: OpenAIEmbeddings;
  private storeDir: string;

  private constructor() {
    console.log("Initializing ChatService with OpenAI model...");
    console.log(
      "Using OpenAI API Key:",
      process.env.OPENAI_API_KEY ? "Provided" : "Not Provided"
    );
    this.embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
    });
    this.storeDir = path.join(process.cwd(), "vector_stores");

    if (!fs.existsSync(this.storeDir)) {
      fs.mkdirSync(this.storeDir, { recursive: true });
    }
  }

  static getInstance(): VectorStoreService {
    if (!VectorStoreService.instance) {
      VectorStoreService.instance = new VectorStoreService();
    }
    return VectorStoreService.instance;
  }

  private async getOrCreateStore(userId: string): Promise<HNSWLib> {
    if (this.stores.has(userId)) {
      return this.stores.get(userId)!;
    }

    const storePath = path.join(this.storeDir, userId);

    try {
      if (fs.existsSync(storePath)) {
        const store = await HNSWLib.load(storePath, this.embeddings);
        this.stores.set(userId, store);
        return store;
      }
    } catch (error) {
      console.log(`Creating new vector store for user ${userId}`);
    }

    const store = await HNSWLib.fromDocuments(
      [new Document({ pageContent: "Initialization document", metadata: {} })],
      this.embeddings
    );

    this.stores.set(userId, store);
    return store;
  }

  async addDocuments(chunks: DocumentChunk[], userId: string): Promise<void> {
    const store = await this.getOrCreateStore(userId);

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
    );

    await store.addDocuments(documents);

    const storePath = path.join(this.storeDir, userId);
    await store.save(storePath);

    console.log(`Added ${chunks.length} chunks for user ${userId}`);
  }

  async similaritySearch(
    query: string,
    userId: string,
    k = 3
  ): Promise<VectorDocument[]> {
    try {
      const store = await this.getOrCreateStore(userId);
      const results = await store.similaritySearch(query, k);

      return results
        .filter((doc) => doc.pageContent !== "Initialization document")
        .map((doc) => ({
          pageContent: doc.pageContent,
          metadata: {
            fileId: doc.metadata.fileId,
            fileName: doc.metadata.fileName,
            chunkIndex: doc.metadata.chunkIndex,
          },
        }));
    } catch (error) {
      console.error("Similarity search error:", error);
      return [];
    }
  }

  async deleteDocumentsByFileId(fileId: string, userId: string): Promise<void> {
    try {
      const storePath = path.join(this.storeDir, userId);

      // Check if store exists
      if (!fs.existsSync(storePath)) {
        console.log(`No store found for user ${userId}`);
        return;
      }

      // Load the current store
      const store = await this.getOrCreateStore(userId);

      // Get all documents from the store
      // Since HNSWLib doesn't expose documents directly, we need to do a workaround
      // We'll perform a broad search to get all documents
      const allDocs = await store.similaritySearch("", 1000); // Get up to 1000 docs

      // Filter out documents with matching fileId
      const remainingDocs = allDocs.filter(
        (doc) => doc.metadata.fileId !== fileId
      );

      if (remainingDocs.length === allDocs.length) {
        console.log(`No documents found for fileId ${fileId}`);
        return;
      }

      console.log(
        `Removing ${
          allDocs.length - remainingDocs.length
        } chunks for file ${fileId}`
      );

      // If no documents remain, delete the entire store
      if (remainingDocs.length === 0) {
        this.stores.delete(userId);
        // Delete the store directory
        const files = fs.readdirSync(storePath);
        for (const file of files) {
          fs.unlinkSync(path.join(storePath, file));
        }
        fs.rmdirSync(storePath);
        console.log(`Deleted empty store for user ${userId}`);
        return;
      }

      // Rebuild the store with remaining documents
      const newStore = await HNSWLib.fromDocuments(
        remainingDocs,
        this.embeddings
      );

      // Save and update
      await newStore.save(storePath);
      this.stores.set(userId, newStore);

      console.log(
        `Rebuilt store for user ${userId} with ${remainingDocs.length} documents`
      );
    } catch (error) {
      console.error("Delete documents error:", error);
      throw error;
    }
  }
}
