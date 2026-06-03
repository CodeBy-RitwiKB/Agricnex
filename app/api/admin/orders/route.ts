import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const [pendingCount, transitCount, disputedCount, orders] = await Promise.all([
      prisma.orders.count({
        where: { status: "pending" }
      }),
      prisma.orders.count({
        where: {
          status: {
            in: ["processing", "shipped"]
          }
        }
      }),
      prisma.orders.count({
        where: {
          OR: [
            { payment_status: "failed" },
            { status: "cancelled" }
          ]
        }
      }),
      prisma.orders.findMany({
        orderBy: { created_at: "desc" },
        include: {
          users: true,
          order_items: {
            include: {
              products: {
                include: {
                  merchants: true
                }
              }
            }
          }
        }
      })
    ]);

    const formattedOrders = orders.map((o) => {
      // Find merchant names associated with order items
      const merchantNames = o.order_items
        .map((item) => item.products?.merchants?.store_name)
        .filter(Boolean);
      
      const merchant = merchantNames.length > 0 
        ? Array.from(new Set(merchantNames)).join(", ") 
        : "Direct Platform";

      return {
        id: o.id,
        createdAt: o.created_at,
        merchant,
        customer: o.users?.name || "Anonymous",
        amount: Number(o.total_amount),
        status: o.status || "pending",
        paymentStatus: o.payment_status || "unpaid"
      };
    });

    return NextResponse.json({
      success: true,
      stats: {
        pendingApproval: pendingCount,
        globalTransit: transitCount,
        disputedOrders: disputedCount
      },
      orders: formattedOrders
    });
  } catch (error: any) {
    console.error("Error fetching admin orders:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
