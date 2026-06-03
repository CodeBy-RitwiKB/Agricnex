import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const ML_ENGINE_URL = process.env.ML_ENGINE_URL || "http://127.0.0.1:5000";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      include: {
        merchants: true,
        orders: {
          select: {
            id: true,
            total_amount: true,
            created_at: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const now = new Date();

    const populatedUsers = await Promise.all(
      users.map(async (user) => {
        let cohort = "N/A";
        let churnRisk = "N/A";
        let churnScore = 0;
        let tenureDays = 0;

        if (user.role === "customer") {
          const totalOrders = user.orders.length;
          const totalSpent = user.orders.reduce((sum, o) => sum + Number(o.total_amount), 0);

          const userCreated = user.createdAt ? new Date(user.createdAt) : now;
          tenureDays = Math.max(1, Math.ceil((now.getTime() - userCreated.getTime()) / (1000 * 60 * 60 * 24)));

          let recencyDays = tenureDays;
          if (totalOrders > 0 && user.orders[0].created_at) {
            const sortedOrders = [...user.orders].sort(
              (a, b) => new Date(b.created_at || "").getTime() - new Date(a.created_at || "").getTime()
            );
            if (sortedOrders[0].created_at) {
              const lastOrderDate = new Date(sortedOrders[0].created_at);
              recencyDays = Math.max(0, Math.ceil((now.getTime() - lastOrderDate.getTime()) / (1000 * 60 * 60 * 24)));
            }
          }

          cohort = "Standard";
          churnRisk = "Safe";

          try {
            const segmentRes = await fetch(
              `${ML_ENGINE_URL}/api/segment/buyer?buyer_id=${user.id}&recency=${recencyDays}&frequency=${totalOrders}&monetary=${totalSpent}`
            );
            if (segmentRes.ok) {
              const segmentJson = await segmentRes.json();
              cohort = segmentJson.cohort || "Standard";
            }

            const churnRes = await fetch(
              `${ML_ENGINE_URL}/api/churn?recency_days=${recencyDays}&total_orders=${totalOrders}&total_spent=${totalSpent}&tenure_days=${tenureDays}`
            );
            if (churnRes.ok) {
              const churnJson = await churnRes.json();
              churnRisk = churnJson.dashboard_status || "Safe";
              churnScore = churnJson.churn_risk_score || 0;
            }
          } catch (mlErr) {
            console.warn(`ML predictions offline for customer ${user.id}`);
          }
        }

        const isVerified = user.role === "merchant" 
          ? !!user.merchants?.is_verified 
          : user.emailVerified;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
          role: user.role,
          isVerified,
          cohort,
          churnRisk,
          churnScore,
          lockedUntil: user.lockedUntil,
        };
      })
    );

    return NextResponse.json({ success: true, data: populatedUsers });
  } catch (error: any) {
    console.error("Error fetching admin users:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
