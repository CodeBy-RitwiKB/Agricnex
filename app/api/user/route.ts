import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ success: false, error: "Missing user ID" }, { status: 400 });
    }

    // Perform cascade cleanup transactionally to handle non-cascading relations in DB
    await prisma.$transaction(async (tx) => {
      // 1. Delete order items first
      await tx.order_items.deleteMany({
        where: {
          orders: {
            user_id: userId,
          },
        },
      });

      // 2. Delete orders
      await tx.orders.deleteMany({
        where: {
          user_id: userId,
        },
      });

      // 3. Delete moderation logs
      await tx.moderation_logs.deleteMany({
        where: {
          admin_id: userId,
        },
      });

      // 4. Delete the merchant profile (which cascades to products)
      await tx.merchants.deleteMany({
        where: {
          user_id: userId,
        },
      });

      // 5. Delete the user
      await tx.user.delete({
        where: {
          id: userId,
        },
      });
    });

    return NextResponse.json({ success: true, message: "Account deleted successfully" });
  } catch (error: any) {
    console.error("Failed to delete user account:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { userId, name, phoneNumber, address, image } = body;

    if (!userId) {
      return NextResponse.json({ success: false, error: "Missing user ID" }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        phoneNumber,
        address,
        image,
      },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error: any) {
    console.error("Failed to update user account:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
