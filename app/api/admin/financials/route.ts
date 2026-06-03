import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const orders = await prisma.orders.findMany({
      where: {
        payment_status: "paid"
      },
      orderBy: {
        created_at: "desc"
      },
      include: {
        users: true
      }
    });

    const netRevenue = orders.reduce((sum, o) => sum + Number(o.total_amount), 0);
    
    // Simulate real calculations based on platform parameters
    const merchantPayouts = netRevenue * 0.90; // 90% payouts to merchants
    const platformCommission = netRevenue * 0.10; // 10% platform cut
    const taxLiability = netRevenue * 0.05; // 5% simulated tax / GST liability

    // Format recent transaction/audit logs dynamically
    const auditLogs = orders.slice(0, 5).map((o, idx) => {
      const payoutAmount = Number(o.total_amount) * 0.90;
      return {
        id: o.id,
        merchant: `Store Partner for Order #${o.id.substring(0, 6).toUpperCase()}`,
        bank: o.payment_method || "UPI / NetBanking",
        timestamp: o.created_at || new Date(),
        amount: payoutAmount,
        status: "Settled"
      };
    });

    return NextResponse.json({
      success: true,
      stats: {
        netRevenue,
        merchantPayouts,
        platformCommission,
        taxLiability,
        reserve: netRevenue * 0.15 // simulated platform reserve
      },
      auditLogs
    });
  } catch (error: any) {
    console.error("Error fetching financials stats:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
