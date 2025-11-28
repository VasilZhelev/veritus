import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { imageUrls } = await req.json();

    if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
      return NextResponse.json({ error: "No images provided" }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "GEMINI_API_KEY is not set" }, { status: 500 });
    }

    // Limit to first 2 images to minimize token usage
    const imagesToAnalyze = imageUrls.slice(0, 2);

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    // Fetch images and convert to base64
    const imageDataPromises = imagesToAnalyze.map(async (url: string) => {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          console.error(`Failed to fetch image: ${url}`);
          return null;
        }
        const arrayBuffer = await response.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString('base64');
        
        // Determine mime type from response headers or URL
        const contentType = response.headers.get('content-type') || 'image/jpeg';
        
        return {
          inlineData: {
            data: base64,
            mimeType: contentType
          }
        };
      } catch (error) {
        console.error(`Error processing image ${url}:`, error);
        return null;
      }
    });

    const imageData = (await Promise.all(imageDataPromises)).filter(img => img !== null);

    if (imageData.length === 0) {
      return NextResponse.json({ error: "Failed to process any images" }, { status: 500 });
    }

    // Construct the prompt for damage detection with structured JSON output
    const prompt = `You are an expert car damage inspector. Analyze the provided car images and identify any visible damages, defects, or issues.

Provide your analysis in the following JSON format:
{
  "overallCondition": "Excellent" | "Good" | "Fair" | "Poor",
  "severityLevel": "none" | "minor" | "moderate" | "severe",
  "damages": [
    {
      "location": "specific location (e.g., front bumper, driver side door)",
      "type": "type of damage (e.g., dent, scratch, rust, paint chip)",
      "severity": "minor" | "moderate" | "severe",
      "description": "brief description"
    }
  ],
  "recommendations": [
    "recommendation 1",
    "recommendation 2"
  ],
  "summary": "Brief overall assessment of the vehicle's condition"
}

Be specific and accurate. If no significant damage is visible, return an empty damages array and "none" severity.`;

    // Create the request with text and images
    const contents = [
      {
        role: "user",
        parts: [
          { text: prompt },
          ...imageData
        ]
      }
    ];

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-lite-preview-02-05",
      contents: contents,
    });

    const analysisText = response.text;

    if (!analysisText) {
      return NextResponse.json({ error: "No analysis text returned" }, { status: 500 });
    }

    // Try to parse JSON from the response
    let structuredData;
    try {
      // Extract JSON from potential markdown code blocks
      const jsonMatch = analysisText.match(/```json\s*([\s\S]*?)\s*```/) || 
                       analysisText.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const jsonText = jsonMatch[1] || jsonMatch[0];
        structuredData = JSON.parse(jsonText);
      } else {
        // Fallback: try parsing the entire response
        structuredData = JSON.parse(analysisText);
      }
    } catch (parseError) {
      console.error("Failed to parse JSON response:", parseError);
      // Fallback to basic structure
      structuredData = {
        overallCondition: "Unknown",
        severityLevel: "unknown",
        damages: [],
        recommendations: [],
        summary: analysisText
      };
    }

    return NextResponse.json({ 
      ...structuredData,
      imagesAnalyzed: imageData.length
    });

  } catch (error: any) {
    console.error("Error analyzing images for damage:", error);
    return NextResponse.json({ 
      error: "Failed to analyze images", 
      details: error.message || String(error) 
    }, { status: 500 });
  }
}
