import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const MODEL_NAME = "gemini-3.1-flash-lite";

// List of agricultural stop words or common terms to ignore when extracting keywords
const STOP_WORDS = new Set([
  "i", "want", "to", "buy", "find", "search", "show", "me", "the", "a", "an", "is", "are", 
  "was", "were", "do", "you", "have", "need", "for", "please", "can", "help", "what", "how", "much"
]);

export async function POST(req: Request) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "Gemini API Key is not configured in .env.local" }, { status: 500 });
    }

    const { messages, language = "English" } = await req.json();
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Invalid or empty messages array" }, { status: 400 });
    }

    // Get the user's latest query
    const latestMessage = messages[messages.length - 1];
    const userQuery = latestMessage.content || "";

    // 1. Retrieval Step: Extract keywords and search database products
    const words = userQuery
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .split(/\s+/)
      .filter((w: string) => w.length > 2 && !STOP_WORDS.has(w));

    let matchedProducts: any[] = [];

    if (words.length > 0) {
      // Build search conditions for each keyword
      const conditions = words.map((word: string) => ({
        OR: [
          { name: { contains: word, mode: "insensitive" as const } },
          { description: { contains: word, mode: "insensitive" as const } },
          { categories: { name: { contains: word, mode: "insensitive" as const } } }
        ]
      }));

      matchedProducts = await prisma.products.findMany({
        where: {
          status: "active",
          OR: conditions
        },
        include: {
          categories: true
        },
        take: 8
      });
    }

    // Fallback/enrichment: If no products matched the specific keywords, fetch some popular products
    if (matchedProducts.length < 4) {
      const popularProducts = await prisma.products.findMany({
        where: { status: "active" },
        include: { categories: true },
        take: 6,
        orderBy: { created_at: "desc" }
      });
      
      // Merge lists without duplicates
      const existingIds = new Set(matchedProducts.map(p => p.id));
      for (const prod of popularProducts) {
        if (!existingIds.has(prod.id)) {
          matchedProducts.push(prod);
        }
      }
    }

    // 2. Fetch government schemes or news if the query is related
    let schemeContext = "";
    const isSchemeQuery = /scheme|yojana|subsidy|government|sarkar|help/i.test(userQuery);
    if (isSchemeQuery) {
      try {
        // Fetch from internal route using relative URL if absolute isn't available,
        // or execute the fetching logic directly or fall back gracefully
        const schemesRes = await fetch("https://news.google.com/rss/search?q=site:pib.gov.in+agriculture+scheme+yojana&hl=hi&gl=IN&ceid=IN:hi", { signal: AbortSignal.timeout(4000) });
        if (schemesRes.ok) {
          const xmlText = await schemesRes.text();
          // Extract titles using regex to avoid heavy parser dependencies
          const matches = xmlText.matchAll(/<title>(.*?)<\/title>/g);
          const titles: string[] = [];
          for (const match of matches) {
            const title = match[1].split(" - ")[0];
            if (title && !title.includes("Google News") && !title.includes("Home") && titles.length < 5) {
              titles.push(title);
            }
          }
          if (titles.length > 0) {
            schemeContext = `Latest Government Agriculture Schemes (Yojanas):\n` + titles.map((t, idx) => `${idx + 1}. ${t}`).join("\n");
          }
        }
      } catch (schemeErr) {
        console.warn("Failed to fetch schemes context:", schemeErr);
      }
    }

    // Format products for prompt injection
    const formattedProducts = matchedProducts.map((p) => ({
      id: p.id,
      name: p.name,
      category: p.categories?.name || "General",
      price: `₹${Number(p.price).toFixed(2)}`,
      unit: p.unit,
      tag: p.tag || "N/A",
      in_stock: (p.stock_quantity || 0) > 0 ? "Yes" : "No",
      stock_quantity: p.stock_quantity || 0,
      description: p.description || ""
    }));

    // 3. Augment: Construct system instructions with context
    const systemInstruction = `You are AgriBot, the premium intelligent virtual assistant for Agrinex, a state-of-the-art agricultural e-commerce marketplace.
Your goal is to assist farmers, merchants, and customers with agricultural inquiries, product searches, pest/disease advice, and government schemes.

Here is the retrieved context from the Agrinex platform:
===
RETIRED PRODUCTS IN STORE:
${JSON.stringify(formattedProducts, null, 2)}

${schemeContext ? `GOVERNMENT SCHEMES:\n${schemeContext}\n` : ""}
===

Guidelines:
1. Always be professional, warm, and expert. You MUST write your entire response ONLY in the following language: ${language}. Translate the products and tips naturally.
2. If the user asks about buying/finding products, recommend matching items from the "RETIRED PRODUCTS IN STORE" list above.
3. For EVERY product you recommend, format it as a single-line bullet point. DO NOT display properties like price or stock status on separate lines. Use the exact link format:
   - **[Product Name](/product/[id])** — **Price** *(In Stock / Out of Stock)* — Short description/reason for recommendation.
4. If no matching products exist in the store catalog, mention that we don't have it in stock currently, but suggest helpful alternatives or give expert farming advice.
5. Provide precise, actionable advice on crops, pest control, fertilizers, and seasonal planting.
6. Keep formatting neat and professional using headings, bullet points, and relevant emojis.`;

    // 4. Generate: Call Gemini API
    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
      systemInstruction: systemInstruction,
    });

    // Format conversation history for Gemini chat API
    // Gemini chat history expects roles to be either 'user' or 'model', and MUST start with a 'user' message.
    const firstUserIndex = messages.findIndex((m: any) => m.role === "user");
    const historyMessages = firstUserIndex !== -1 ? messages.slice(firstUserIndex, -1) : [];

    const chatSession = model.startChat({
      history: historyMessages.map((m: any) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      })),
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        maxOutputTokens: 1024,
      }
    });

    const result = await chatSession.sendMessage(userQuery);
    const responseText = result.response.text();

    return NextResponse.json({
      success: true,
      content: responseText,
      retrievedCount: matchedProducts.length
    });

  } catch (error: any) {
    console.error("RAG Chat Error:", error);
    return NextResponse.json({ error: error.message || "Failed to process chat query" }, { status: 500 });
  }
}
