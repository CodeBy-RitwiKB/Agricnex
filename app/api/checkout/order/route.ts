import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ success: false, error: "Missing user ID" }, { status: 400 });
    }

    const userOrders = await prisma.orders.findMany({
      where: { user_id: userId },
      include: {
        order_items: {
          include: {
            products: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });

    return NextResponse.json({ success: true, orders: userOrders });
  } catch (error: any) {
    console.error("Failed to fetch user orders:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, totalAmount, paymentMethod, shippingAddress, items } = body;

    if (!userId || !items || items.length === 0) {
      return NextResponse.json({ success: false, error: "Missing required order data" }, { status: 400 });
    }

    // Use a Prisma transaction to ensure order and items are created atomically
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create the Order
      const order = await tx.orders.create({
        data: {
          user_id: userId,
          total_amount: Number(totalAmount),
          status: "pending",
          payment_status: paymentMethod === "cod" ? "unpaid" : "paid",
          payment_method: paymentMethod,
          shipping_address: shippingAddress,
          paid_at: paymentMethod === "cod" ? null : new Date(),
        },
      });

      // 2. Create the Order Items
      const orderItemsData = items.map((item: any) => ({
        order_id: order.id,
        product_id: item.id,
        quantity: Number(item.quantity),
        price_at_purchase: Number(item.price),
      }));

      await tx.order_items.createMany({
        data: orderItemsData,
      });

      // 3. Deduct stock quantities for each product
      for (const item of items) {
        await tx.products.update({
          where: { id: item.id },
          data: {
            stock_quantity: {
              decrement: Number(item.quantity),
            },
          },
        });
      }

      return order;
    });

    return NextResponse.json({ success: true, orderId: result.id });
  } catch (error: any) {
    console.error("Failed to store order in database:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
