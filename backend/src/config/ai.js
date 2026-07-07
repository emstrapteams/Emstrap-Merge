import dotenv from "dotenv";

dotenv.config();

const DEFAULT_AI_URL = "http://127.0.0.1:8000";

export const AI_SERVICE_URL =
  process.env.AI_SERVICE_URL?.trim() || DEFAULT_AI_URL;

console.log(`📡 AI Service: ${AI_SERVICE_URL}`);