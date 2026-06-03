import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const db = prisma as any;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ success: false, error: "Missing user ID" }, { status: 400 });
    }

    const items = await db.wishlist.findMany({
      where: { user_id: userId },
      include: {
        products: true,
      },
      orderBy: {
        created_at: "desc",
      },
    });

    return NextResponse.json({ success: true, items });
  } catch (error: any) {
    console.error("Failed to fetch wishlist:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, productId } = body;

    if (!userId || !productId) {
      return NextResponse.json({ success: false, error: "Missing user ID or product ID" }, { status: 400 });
    }

    // Upsert or create unique wishlist item
    const existing = await db.wishlist.findUnique({
      where: {
        user_id_product_id: {
          user_id: userId,
          product_id: productId,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ success: true, item: existing, message: "Item already in wishlist" });
    }

    const item = await db.wishlist.create({
      data: {
        user_id: userId,
        product_id: productId,
      },
    });

    return NextResponse.json({ success: true, item });
  } catch (error: any) {
    console.error("Failed to add to wishlist:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const productId = searchParams.get("productId");
    const id = searchParams.get("id");

    if (id) {
      await db.wishlist.delete({
        where: { id },
      });
    } else if (userId && productId) {
      await db.wishlist.delete({
        where: {
          user_id_product_id: {
            user_id: userId,
            product_id: productId,
          },
        },
      });
    } else {
      return NextResponse.json({ success: false, error: "Missing identifying parameters" }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: "Wishlist item removed" });
  } catch (error: any) {
    console.error("Failed to remove from wishlist:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

