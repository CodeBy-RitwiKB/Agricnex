import { NextResponse } from "next/server";
import axios from "axios";
import * as cheerio from "cheerio";

export async function GET() {
  try {
    const response = await axios.get("https://news.google.com/rss/search?q=site:pib.gov.in+agriculture+scheme+yojana&hl=hi&gl=IN&ceid=IN:hi");
    const $ = cheerio.load(response.data, { xmlMode: true });
    const schemes: any[] = [];
    
    $("item").each((i, el) => {
      const fullTitle = $(el).find("title").text();
      const title = fullTitle.split(" - ")[0];
      
      // Skip generic index pages or very short titles
      if (title.includes("होम पेज") || title.includes("Home Page") || title.includes("पत्र सूचना कार्यालय") || title.length < 15) {
        return;
      }

      schemes.push({
        title: title,
        link: $(el).find("link").text(),
        pubDate: $(el).find("pubDate").text(),
        description: $(el).find("description").text().replace(/<[^>]*>?/gm, ''),
        image: null,
      });

      if (schemes.length >= 10) return false;
    });

    return NextResponse.json({ success: true, data: schemes });
  } catch (error: any) {
    console.error("Error fetching schemes:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch schemes" },
      { status: 500 }
    );
  }
}
