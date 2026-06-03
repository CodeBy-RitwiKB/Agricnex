import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ success: false, error: "Missing user ID" }, { status: 400 });
    }

    const reviews = await prisma.reviews.findMany({
      where: { user_id: userId },
      include: {
        products: true,
      },
      orderBy: {
        created_at: "desc",
      },
    });

    return NextResponse.json({ success: true, reviews });
  } catch (error: any) {
    console.error("Failed to fetch user reviews:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const reviewId = searchParams.get("reviewId");

    if (!reviewId) {
      return NextResponse.json({ success: false, error: "Missing review ID" }, { status: 400 });
    }

    await prisma.reviews.delete({
      where: { id: reviewId },
    });

    return NextResponse.json({ success: true, message: "Review deleted successfully" });
  } catch (error: any) {
    console.error("Failed to delete review:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
