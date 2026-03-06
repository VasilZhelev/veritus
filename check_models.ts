import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

async function listModels() {
  if (!process.env.GEMINI_API_KEY) {
    console.error("No GEMINI_API_KEY found in environment");
    return;
  }
  
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
  try {
    const models = await ai.models.list();
    console.log("Available models:");
    for (const model of models) {
      console.log(`- ${model.name} (${model.displayName})`);
    }
  } catch (e) {
    console.error("Error listing models:", e);
  }
}

listModels();
