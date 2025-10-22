import { Response } from "express";
import { ChatService } from "../services/chatService";
import { VectorStoreService } from "../services/vectorStore";
import { AuthRequest } from "../types";

// Lazy initialization to ensure env vars are loaded
let vectorStore: VectorStoreService | null = null;
let chatService: ChatService | null = null;

const getVectorStore = () => {
  if (!vectorStore) {
    vectorStore = VectorStoreService.getInstance();
  }
  return vectorStore;
};

const getChatService = () => {
  if (!chatService) {
    chatService = new ChatService();
  }
  return chatService;
};

export const chat = async (req: AuthRequest, res: Response) => {
  try {
    const { message, model } = req.body;

    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }

    const userId = req.user!.userId;

    // Retrieve relevant documents - increased from 3 to 10 for better coverage
    const relevantDocs = await getVectorStore().similaritySearch(
      message,
      userId,
      10
    );

    if (relevantDocs.length === 0) {
      return res.json({
        message:
          "Je n'ai trouvé aucun document pertinent pour répondre à votre question. Veuillez d'abord télécharger des documents.",
        sources: [],
      });
    }

    // Rerank documents based on keyword overlap for better relevance
    const queryKeywords = message
      .toLowerCase()
      .split(/\s+/)
      .filter((word: string) => word.length > 3); // Filter short words

    const rankedDocs = relevantDocs.map((doc) => {
      const contentLower = doc.pageContent.toLowerCase();
      const matchScore = queryKeywords.reduce(
        (score: number, keyword: string) => {
          // Count keyword occurrences in content
          const occurrences = (
            contentLower.match(new RegExp(keyword, "g")) || []
          ).length;
          return score + occurrences;
        },
        0
      );

      return {
        ...doc,
        rerankScore: matchScore,
      };
    });

    // Sort by rerank score (descending) and take top results
    rankedDocs.sort((a, b) => b.rerankScore - a.rerankScore);

    // Remove the rerankScore before passing to AI
    const finalDocs = rankedDocs.map(({ rerankScore, ...doc }) => doc);

    // Generate response using AI with optional model parameter
    const response = await getChatService().generateResponse(
      message,
      finalDocs,
      model
    );

    // Deduplicate sources by fileId to avoid showing the same file multiple times
    const uniqueSources = new Map<
      string,
      { fileId: string; fileName: string; content: string; score: number }
    >();

    finalDocs.forEach((doc) => {
      const fileId = doc.metadata.fileId;
      if (!uniqueSources.has(fileId)) {
        uniqueSources.set(fileId, {
          fileId: fileId,
          fileName: doc.metadata.fileName,
          content: doc.pageContent.substring(0, 200) + "...",
          score: 0,
        });
      }
    });

    const sources = Array.from(uniqueSources.values());

    res.json({
      message: response,
      sources,
    });
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getModels = async (req: AuthRequest, res: Response) => {
  try {
    // Récupérer la liste des modèles depuis l'API OpenAI
    const response = await fetch("https://api.openai.com/v1/models", {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch models from OpenAI");
    }

    const data: any = await response.json();
    console.log("Fetched models from OpenAI:", data);

    // Filtrer uniquement les modèles GPT pour le chat et les trier
    const chatModels = data.data
      .filter((model: any) => {
        const id = model.id;
        // Filtrer pour ne garder que les modèles GPT appropriés pour le chat
        return (
          (id.startsWith("gpt-4") ||
            (id.startsWith("gpt-5") &&
              (id.includes("chat") ||
                id.includes("mini") ||
                id.includes("nano")))) &&
          !id.includes("audio") &&
          !id.includes("vision") &&
          !id.includes("instruct") &&
          !id.includes("0301") &&
          !id.includes("0314") &&
          !id.includes("0613") &&
          !id.includes("realtime")
        );
      })
      .map((model: any) => {
        const id = model.id;
        let name = id;
        let description = "Modèle OpenAI";
        let contextWindow = 8192; // Valeur par défaut

        // Enrichir avec des informations spécifiques
        if (id.startsWith("gpt-5")) {
          name = id.replace("gpt-5-", "GPT-5 ").replace("gpt-5", "GPT-5");
          description = "Modèle GPT-5 de nouvelle génération";
          contextWindow = 400000;
        } else if (id === "gpt-4o") {
          name = "GPT-4o";
          description = "Le plus récent et performant";
          contextWindow = 128000;
        } else if (id === "gpt-4o-mini") {
          name = "GPT-4o Mini";
          description = "Rapide et économique";
          contextWindow = 128000;
        } else if (id.includes("gpt-4-turbo")) {
          name = "GPT-4 Turbo";
          description = "Puissant avec large contexte";
          contextWindow = 128000;
        } else if (id === "gpt-4") {
          name = "GPT-4";
          description = "Modèle classique GPT-4";
          contextWindow = 8192;
        } else if (id.includes("gpt-3.5-turbo")) {
          name = "GPT-3.5 Turbo";
          description = "Économique et rapide";
          contextWindow = 16385;
        } else if (id.includes("gpt-4o-2024")) {
          name = id.replace("gpt-4o-", "GPT-4o ");
          description = "Version datée de GPT-4o";
          contextWindow = 128000;
        } else if (id.includes("gpt-4-")) {
          name = id.replace("gpt-4-", "GPT-4 ");
          description = "Version GPT-4";
          contextWindow = 8192;
        }

        return {
          id: model.id,
          name: name,
          description: description,
          contextWindow: contextWindow,
          created: model.created,
        };
      })
      .sort((a: any, b: any) => {
        // Trier par priorité : gpt-4o > gpt-4o-mini > gpt-4-turbo > gpt-4 > gpt-3.5
        const priority: { [key: string]: number } = {
          "gpt-5-chat-latest": 1,
          "gpt-4o": 2,
          "gpt-4o-mini": 3,
          "gpt-4-turbo": 4,
          "gpt-4": 5,
          "gpt-3.5-turbo": 6,
        };

        const aPriority = priority[a.id] || 999;
        const bPriority = priority[b.id] || 999;

        if (aPriority !== bPriority) {
          return aPriority - bPriority;
        }

        // Si même priorité, trier par date (plus récent d'abord)
        return b.created - a.created;
      });

    res.json({ models: chatModels });
  } catch (error) {
    console.error("Get models error:", error);

    // En cas d'erreur, retourner une liste de fallback
    const fallbackModels = [
      {
        id: "gpt-4o",
        name: "GPT-4o",
        description: "Le plus récent et performant",
        contextWindow: 128000,
      },
      {
        id: "gpt-4o-mini",
        name: "GPT-4o Mini",
        description: "Rapide et économique",
        contextWindow: 128000,
      },
      {
        id: "gpt-4-turbo",
        name: "GPT-4 Turbo",
        description: "Puissant avec large contexte",
        contextWindow: 128000,
      },
      {
        id: "gpt-4",
        name: "GPT-4",
        description: "Modèle classique GPT-4",
        contextWindow: 8192,
      },
      {
        id: "gpt-3.5-turbo",
        name: "GPT-3.5 Turbo",
        description: "Économique et rapide",
        contextWindow: 16385,
      },
    ];

    res.json({ models: fallbackModels });
  }
};
