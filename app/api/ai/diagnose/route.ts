import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const MODEL_NAME = "gemini-3.1-flash-lite";

// Helper for waiting
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function POST(req: Request) {
  try {
    const { image } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "API Key not configured" }, { status: 500 });
    }

    const base64Data = image.split(",")[1];
    const prompt = `Act as an expert Plant Pathologist. Analyze this agricultural leaf image with extreme detail. 
    1. Identify the crop species.
    2. Look for ANY signs of infection: spots, lesions, discoloration, wilting, or pest damage.
    3. If the leaf is not 100% perfect, identify the most likely disease or nutrient deficiency.
    
    Provide the output ONLY in JSON format:
    {
      "condition": "Specific Name",
      "confidence": 0-100,
      "severity": "Low/Moderate/High/Critical",
      "description": "Deep clinical detail of symptoms",
      "treatment": "Clear organic and chemical steps",
      "products": [
        {
          "name": "Product Name", 
          "price": "₹Value", 
          "icon": "Emoji", 
          "tag": "Value Choice", 
          "reason": "Why this is good for budget"
        },
        {
          "name": "Product Name", 
          "price": "₹Value", 
          "icon": "Emoji", 
          "tag": "Most Popular", 
          "reason": "Used by 1,000+ farmers nearby"
        },
        {
          "name": "Product Name", 
          "price": "₹Value", 
          "icon": "Emoji", 
          "tag": "Expert Choice", 
          "reason": "Highest clinical efficacy"
        }
      ]
    }
    Suggest real, popular Indian agricultural brands like Bayer, Syngenta, or UPL.`;

    const model = genAI.getGenerativeModel({ 
      model: MODEL_NAME,
      generationConfig: {
        temperature: 0.1,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 1024,
      }
    });

    let lastError = null;
    const MAX_RETRIES = 1; // Try once + 1 retry = 2 total attempts

    // Retry Strategy with Exponential Backoff
    for (let i = 0; i <= MAX_RETRIES; i++) {
      try {
        if (i > 0) {
          console.log(`Retry attempt ${i} for ${MODEL_NAME}...`);
          await sleep(3000); // Wait 3 seconds for the spike to clear
        }

        const result = await model.generateContent([
          prompt,
          {
            inlineData: {
              data: base64Data,
              mimeType: "image/jpeg"
            }
          }
        ]);

        const response = await result.response;
        const text = response.text();
        
        const jsonStr = text.replace(/```json|```/g, "").trim();
        const data = JSON.parse(jsonStr);

        return NextResponse.json(data);
      } catch (err: any) {
        lastError = err;
        console.warn(`Attempt ${i+1} failed:`, err.message);
        
        // If it's NOT a busy error (503), don't bother retrying
        if (!err.message.includes("503") && !err.message.includes("high demand")) {
          break;
        }
      }
    }

    throw lastError;

  } catch (error: any) {
    console.error("AI Diagnosis Error:", error);
    
    if (error.message?.includes("503") || error.message?.includes("high demand")) {
        return NextResponse.json({ 
            error: "The AI is currently busy with many farmers. Please wait 15 seconds and try again." 
        }, { status: 503 });
    }

    return NextResponse.json({ error: error.message || "Failed to analyze image" }, { status: 500 });
  }
}
