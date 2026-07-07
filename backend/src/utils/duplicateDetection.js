import axios from "axios";
import { AI_SERVICE_URL } from "../config/ai.js";

// Axios instance for AI service
const aiService = axios.create({
  baseURL: AI_SERVICE_URL,
  timeout: 10000, // 10 seconds
});

// ==========================
// Generate Image Embedding
// ==========================
export const generateEmbedding = async (imageUrl) => {
  try {
    if (!imageUrl) {
      throw new Error("Image URL is required.");
    }

    const { data } = await aiService.post("/embedding", {
      imageUrl,
    });

    if (!data?.embedding) {
      throw new Error("Embedding not returned by AI service.");
    }

    return data.embedding;
  } catch (error) {
    console.error("Generate Embedding Error:", error.message);

    throw new Error(
      error.response?.data?.message ||
      "Failed to generate image embedding."
    );
  }
};

// ==========================
// Compare Two Embeddings
// ==========================
export const compareEmbeddings = async (
  embedding1,
  embedding2
) => {
  try {
    if (!Array.isArray(embedding1) || !Array.isArray(embedding2)) {
      throw new Error("Invalid embedding vectors.");
    }

    const { data } = await aiService.post("/compare", {
      embedding1,
      embedding2,
    });

    if (typeof data?.similarity !== "number") {
      throw new Error("Similarity score not returned.");
    }

    return data.similarity;
  } catch (error) {
    console.error("Compare Embeddings Error:", error.message);

    throw new Error(
      error.response?.data?.message ||
      "Failed to compare embeddings."
    );
  }
};