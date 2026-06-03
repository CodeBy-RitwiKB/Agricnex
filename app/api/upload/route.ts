import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const { file } = await request.json();
    if (!file) {
      return NextResponse.json({ success: false, error: "No file payload provided" }, { status: 400 });
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json({ success: false, error: "Cloudinary credentials not configured on server" }, { status: 500 });
    }

    const timestamp = Math.round(new Date().getTime() / 1000);
    // Cloudinary signature parameters must be sorted alphabetically
    const signatureStr = `timestamp=${timestamp}${apiSecret}`;
    const signature = crypto.createHash("sha1").update(signatureStr).digest("hex");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", apiKey);
    formData.append("timestamp", timestamp.toString());
    formData.append("signature", signature);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (data.error) {
      return NextResponse.json({ success: false, error: data.error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, url: data.secure_url });
  } catch (error: any) {
    console.error("Cloudinary upload failed:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
