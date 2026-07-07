import axios from "axios";
import { AI_SERVICE_URL } from "../config/ai.js";

/**
 * Axios client for AI service
 */
const aiClient = axios.create({
  baseURL: AI_SERVICE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Generate image embedding from AI service
 */
export const generateEmbedding = async (imageUrl) => {
  try {
    const { data } = await aiClient.post("/embedding", {
      imageUrl,
    });

    if (!data?.embedding) {
      throw new Error("Embedding not returned from AI service");
    }

    return data.embedding;
  } catch (error) {
    console.error("generateEmbedding error:", error.message);
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to generate embedding"
    );
  }
};

/**
 * Compare two embeddings and return similarity score (0 - 1)
 */
export const compareEmbeddings = async (embedding1, embedding2) => {
  try {
    const { data } = await aiClient.post("/compare", {
      embedding1,
      embedding2,
    });

    if (typeof data?.similarity !== "number") {
      throw new Error("Similarity not returned from AI service");
    }

    return data.similarity;
  } catch (error) {
    console.error("compareEmbeddings error:", error.message);
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to compare embeddings"
    );
  }
};