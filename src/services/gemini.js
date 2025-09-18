import { GoogleGenAI } from "@google/genai";

export const getAIInstance = () => {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    throw new Error("Missing Gemini API key in environment variables");
  }
  const ai = new GoogleGenAI({
    apiKey: GEMINI_API_KEY,
  });
  return ai;
};
