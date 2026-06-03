import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ids = searchParams.get("ids")?.split(",") || [];

  if (ids.length === 0) {
    return NextResponse.json({ success: true, data: [] });
  }

  try {
    const products = await prisma.products.findMany({
      where: {
        id: { in: ids },
      },
      include: {
        categories: true,
      },
    });

    // Add a dummy originalPrice for UI consistency if not in DB
    const data = products.map((p: any) => ({
      ...p,
      price: Number(p.price),
      originalPrice: Number(p.price) * 1.3 // Simulate a 30% discount
    }));

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Bulk fetch error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch products" }, { status: 500 });
  }
}
