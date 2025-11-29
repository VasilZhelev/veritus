import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { message, listings, history } = await req.json();
    const [car1, car2] = listings;

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "GEMINI_API_KEY is not set" }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const prompt = `
      You are an expert car consultant helping a user choose between two cars.
      
      Car 1:
      - Brand/Model: ${car1.brand} ${car1.model}
      - Year: ${car1.year}
      - Price: ${car1.price} ${car1.currency}
      - Mileage: ${car1.mileage} km
      - Fuel: ${car1.fuelType}
      - Transmission: ${car1.transmission}
      - Location: ${car1.location}
      - Description: ${car1.description?.substring(0, 500)}...
      
      Car 2:
      - Brand/Model: ${car2.brand} ${car2.model}
      - Year: ${car2.year}
      - Price: ${car2.price} ${car2.currency}
      - Mileage: ${car2.mileage} km
      - Fuel: ${car2.fuelType}
      - Transmission: ${car2.transmission}
      - Location: ${car2.location}
      - Description: ${car2.description?.substring(0, 500)}...

      User Question: "${message}"

      Instructions:
      1. Compare the two cars objectively based on the provided data.
      2. Highlight the pros and cons of each relative to the other.
      3. Give a recommendation based on the user's implied needs (e.g., if they ask about city driving, favor the smaller/more efficient one).
      4. Be concise, professional, and helpful.
      5. Format your response with clear paragraphs or bullet points.
    `;

    // Convert history to Gemini format if needed, but for now we just use the prompt with context
    // Ideally we should pass history to chat session, but single turn with context is often enough for simple comparison
    
    const result = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt,
    });
    
    const response = result.text;

    return NextResponse.json({ response });
  } catch (error) {
    console.error("Compare chat error:", error);
    return NextResponse.json(
      { error: "Failed to generate response" },
      { status: 500 }
    );
  }
}
