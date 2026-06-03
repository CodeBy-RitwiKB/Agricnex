import { NextResponse } from "next/server";
import axios from "axios";
import * as cheerio from "cheerio";

export async function GET() {
  try {
    const response = await axios.get("https://www.ruralvoice.in/rss/latest-posts");
    const $ = cheerio.load(response.data, { xmlMode: true });
    const news: { title: string; link: string; pubDate: string; description: string; image: string | null; }[] = [];

    $("item").slice(0, 10).each((i, el) => {
      let imageUrl = $(el).find("enclosure").attr("url") || null;
      if (imageUrl && imageUrl.startsWith("http://")) {
        imageUrl = imageUrl.replace("http://", "https://");
      }
      news.push({
        title: $(el).find("title").text(),
        link: $(el).find("link").text(),
        pubDate: $(el).find("pubDate").text(),
        description: $(el).find("description").text().replace(/<[^>]*>?/gm, ''),
        image: imageUrl,
      });
    });

    return NextResponse.json({ success: true, data: news });
  } catch (error: any) {
    console.error("Error fetching news:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch news" },
      { status: 500 }
    );
  }
}
