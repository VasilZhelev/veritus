import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { imageUrls, language } = await req.json();

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
          console.error(`Failed to fetch image: ${url} - Status: ${response.status}`);
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
      return NextResponse.json({ error: "Failed to process any images. Please check if the image URLs are valid." }, { status: 422 });
    }

    // Construct the prompt for damage detection with structured JSON output
    const prompt = `You are an expert car damage inspector. Analyze the provided car images and identify any visible damages, defects, or issues.
IMPORTANT: Do NOT flag superficial dirt, dust, mud, or dry water spots as damage. Only report actual structural, paint, or material damage (e.g. dents, deep scratches, rust, cracked glass).

Provide your analysis in the following JSON format:
{
  "overallCondition": "Excellent" | "Good" | "Fair" | "Poor",
  "severityLevel": "none" | "minor" | "moderate" | "severe",
  "damages": [
    {
      "location": "specific location (e.g., front bumper, driver side door)",
      "type": "type of damage (e.g., dent, scratch, rust, paint chip)",
      "severity": "minor" | "moderate" | "severe",
      "description": "brief description",
      "estimatedCostEUR": number (Estimated repair cost in EUR just for this specific issue. Provide an integer, e.g. 150. If 0, put 0)
    }
  ],
  "recommendations": [
    "recommendation 1",
    "recommendation 2"
  ],
  "summary": "Brief overall assessment of the vehicle's condition"
}

Be specific and accurate. If no significant damage is visible, return an empty damages array and "none" severity.`;

    let finalPrompt = prompt;
    if (language === 'bg') {
      finalPrompt += `\nCRITICAL INSTRUCTION: Translate the values for "damages[].location", "damages[].type", "damages[].description", "recommendations", and "summary" into Bulgarian. However, you MUST keep "overallCondition", "severityLevel", and "severity" string values exactly in English as defined by the schema (e.g. "Excellent", "minor", etc.).`;
    }

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-lite",
        contents: [
          {
            role: "user",
            parts: [
              { text: finalPrompt },
              ...imageData
            ]
          }
        ],
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

    } catch (geminiError: any) {
      // Check for 429 Rate Limit
      let isRateLimit = geminiError.status === 429;
      let errorMessage = "AI service is currently busy. Please try again in a minute.";
      let isNotFound = geminiError.status === 404 || (geminiError.message && geminiError.message.includes('404'));

      // Detailed error parsing for Gemini API
      if (geminiError.message) {
         if (geminiError.message.includes('429')) isRateLimit = true;
         
         try {
             const jsonStart = geminiError.message.indexOf('{');
             if (jsonStart !== -1) {
                 const jsonPart = geminiError.message.substring(jsonStart);
                 const parsed = JSON.parse(jsonPart);
                 if (parsed.error) {
                    if (parsed.error.code === 429 || parsed.error.status === 'RESOURCE_EXHAUSTED') {
                        isRateLimit = true;
                        errorMessage = "Usage limit exceeded for the AI model. Please try again later.";
                    }
                    if (parsed.error.code === 404) {
                        isNotFound = true;
                        errorMessage = "AI Model not found or unavailable. Please check configuration.";
                    }
                 }
             }
         } catch (e) {
             // ignore parsing error
         }
      }

      if (isRateLimit) {
        console.warn("Gemini API Rate Limit hit for damage check"); 
        return NextResponse.json({ 
          error: errorMessage,
          code: "RATE_LIMIT_EXCEEDED"
        }, { status: 429 });
      }
      
      if (isNotFound) {
        console.error("Gemini Model Not Found:", geminiError.message);
        return NextResponse.json({ 
            error: "Selected AI model is not available. Please contact support.",
            code: "MODEL_NOT_FOUND" 
        }, { status: 404 });
      }

      console.error("Gemini API Error:", geminiError);
      throw geminiError;
    }

  } catch (error: any) {
    console.error("Error analyzing images for damage:", error);
    return NextResponse.json({ 
      error: "Failed to analyze images", 
      details: error.message || String(error) 
    }, { status: 500 });
  }
}
