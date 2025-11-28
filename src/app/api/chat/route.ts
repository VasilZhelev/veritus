import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { message, listing, history } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "GEMINI_API_KEY is not set" }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    // Construct system instruction
    const systemPrompt = `You are a helpful AI assistant for a car listing platform called Veritus.
You are currently helping a user with a specific car listing.
Here are the details of the car:
Title: ${listing.title || 'N/A'}
Brand: ${listing.brand || 'N/A'}
Model: ${listing.model || 'N/A'}
Year: ${listing.year || 'N/A'}
Price: ${listing.price || 'N/A'} ${listing.currency || ''}
Mileage: ${listing.mileageKm || listing.mileage || 'N/A'} km
Location: ${listing.location || 'N/A'}
Description: ${listing.description || 'N/A'}
Features: ${listing.attributes ? Object.entries(listing.attributes).map(([k, v]) => `${k}: ${v}`).join(', ') : 'N/A'}

Your goal is to answer the user's questions about this specific car.
Be concise, helpful, and honest.
If the user asks about price fairness, give a general assessment based on the car's age and mileage, but disclaim that you are an AI.
If the user asks about common issues, mention general issues for this model year.
Do not make up facts about the car that are not in the listing.
`;

    let prompt = systemPrompt + "\n\nConversation History:\n";
    if (history && Array.isArray(history)) {
        history.forEach((msg: any) => {
            // Skip the current message if it's already in history (it shouldn't be based on frontend logic usually, but good to be safe)
            // Actually, frontend usually appends user message to UI state before sending.
            // We'll assume history passed DOES NOT include the current new message, or we handle it.
            // Let's assume history includes everything UP TO the new message.
            if (msg.role === 'user' || msg.role === 'assistant') {
                 prompt += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n`;
            }
        });
    }
    prompt += `User: ${message}\nAssistant:`;

    // Log available models for debugging
    // try {
    //   const models = await ai.models.list();
    //   console.log("Available models:", models);
    // } catch (e) {
    //   console.error("Failed to list models:", e);
    // }

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-lite-preview-02-05",
      contents: prompt,
    });

    return NextResponse.json({ response: response.text });
  } catch (error: any) {
    console.error("Error generating AI response:", error);
    return NextResponse.json({ 
      error: "Failed to generate response", 
      details: error.message || String(error) 
    }, { status: 500 });
  }
}
