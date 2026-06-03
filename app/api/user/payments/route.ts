import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ success: false, error: "Missing user ID" }, { status: 400 });
    }

    // 1. Fetch saved payment methods
    const paymentMethods = await prisma.payment_methods.findMany({
      where: { user_id: userId },
      orderBy: { created_at: "desc" },
    });

    // 2. Fetch paid/completed orders as transaction history
    const transactions = await prisma.orders.findMany({
      where: { user_id: userId },
      select: {
        id: true,
        total_amount: true,
        payment_status: true,
        payment_method: true,
        created_at: true,
      },
      orderBy: { created_at: "desc" },
    });

    return NextResponse.json({
      success: true,
      paymentMethods,
      transactions: transactions.map(t => ({
        id: t.id.substring(0, 8).toUpperCase(),
        title: `${t.payment_method?.toUpperCase() || 'Purchase'} Payment`,
        amount: `₹${Number(t.total_amount).toLocaleString('en-IN')}`,
        status: t.payment_status === "paid" ? "Success" : t.payment_status === "failed" ? "Failed" : "Pending",
        date: t.created_at ? new Date(t.created_at).toLocaleDateString('en-IN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }) : "Unknown Date",
      })),
    });
  } catch (error: any) {
    console.error("Failed to fetch payments info:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, type, provider, last4, isDefault } = body;

    if (!userId || !type || !provider) {
      return NextResponse.json({ success: false, error: "Missing required billing details" }, { status: 400 });
    }

    // If setting as default, unset others first
    if (isDefault) {
      await prisma.payment_methods.updateMany({
        where: { user_id: userId },
        data: { is_default: false },
      });
    }

    const newPaymentMethod = await prisma.payment_methods.create({
      data: {
        user_id: userId,
        type,
        provider,
        last4: last4 || null,
        is_default: !!isDefault,
      },
    });

    return NextResponse.json({ success: true, paymentMethod: newPaymentMethod });
  } catch (error: any) {
    console.error("Failed to add payment method:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
