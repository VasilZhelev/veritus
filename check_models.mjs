import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from project root (2 levels up)
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

async function listModels() {
  if (!process.env.GEMINI_API_KEY) {
    console.error("No GEMINI_API_KEY found in environment");
    return;
  }
  
  console.log("Using API Key:", process.env.GEMINI_API_KEY.substring(0, 10) + "...");

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
  try {
    const response = await ai.models.list();
    // The response might be an object with .models property or an array depending on SDK version
    const models = response.models || response;
    
    console.log("Available models:");
    if (Array.isArray(models)) {
        for (const model of models) {
          console.log(`- ${model.name} (${model.displayName})`);
        }
    } else {
        console.log("Response structure:", JSON.stringify(models, null, 2));
    }
  } catch (e) {
    console.error("Error listing models:", e);
  }
}

listModels();
