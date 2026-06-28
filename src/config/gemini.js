import 'dotenv/config';
import { GoogleGenAI } from "@google/genai";

// Force check if dotenv loaded it properly into process.env
if (!process.env.GEMINI_API_KEY) {
  console.error("❌ CRITICAL: GEMINI_API_KEY is missing from your .env file!");
}

// Pass the key explicitly inside the options object
const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
}); 

export const AI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash'; 

export const generateAIContent = async (contents, systemInstruction = '', modelName = AI_MODEL) => {
  return await genAI.models.generateContent({
    model: modelName,
    contents: contents,
    config: {
      systemInstruction: systemInstruction
    }
  });
};

export default genAI;