import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const ML_ENGINE_URL = process.env.ML_ENGINE_URL || "http://127.0.0.1:5000";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const merchantProfile = await prisma.merchants.findUnique({
      where: { user_id: session.user.id }
    });

    if (!merchantProfile) {
      return NextResponse.json({ success: true, data: [] });
    }

    // 1. Fetch only customers who have ordered products belonging to this merchant
    const customers = await prisma.user.findMany({
      where: {
        role: "customer",
        orders: {
          some: {
            order_items: {
              some: {
                products: {
                  merchant_id: merchantProfile.id
                }
              }
            }
          }
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
        orders: {
          where: {
            order_items: {
              some: {
                products: {
                  merchant_id: merchantProfile.id
                }
              }
            }
          },
          select: {
            id: true,
            created_at: true,
            order_items: {
              where: {
                products: {
                  merchant_id: merchantProfile.id
                }
              },
              select: {
                quantity: true,
                price_at_purchase: true
              }
            }
          },
        },
      },
    });

    const now = new Date();

    // 2. Map and fetch ML data for each customer
    const populatedCustomers = await Promise.all(
      customers.map(async (customer) => {
        const totalOrders = customer.orders.length;
        // Sum price * qty specifically for the items bought from this merchant
        const totalSpent = customer.orders.reduce((sum, order) => {
          const merchantItemsSum = order.order_items.reduce((itemSum, item) => {
            return itemSum + (Number(item.price_at_purchase) * item.quantity);
          }, 0);
          return sum + merchantItemsSum;
        }, 0);

        const userCreated = customer.createdAt ? new Date(customer.createdAt) : now;
        const tenureDays = Math.max(1, Math.ceil((now.getTime() - userCreated.getTime()) / (1000 * 60 * 60 * 24)));

        let recencyDays = tenureDays;
        if (totalOrders > 0 && customer.orders[0].created_at) {
          const sortedOrders = [...customer.orders].sort(
            (a, b) => new Date(b.created_at || "").getTime() - new Date(a.created_at || "").getTime()
          );
          if (sortedOrders[0].created_at) {
            const lastOrderDate = new Date(sortedOrders[0].created_at);
            recencyDays = Math.max(0, Math.ceil((now.getTime() - lastOrderDate.getTime()) / (1000 * 60 * 60 * 24)));
          }
        }

        let cohort = "Standard";
        let churnRisk = "Safe";
        let churnScore = 0;

        try {
          // Fetch cohort segment from ML engine
          const segmentRes = await fetch(
            `${ML_ENGINE_URL}/api/segment/buyer?buyer_id=${customer.id}&recency=${recencyDays}&frequency=${totalOrders}&monetary=${totalSpent}`
          );
          if (segmentRes.ok) {
            const segmentJson = await segmentRes.json();
            cohort = segmentJson.cohort || "Standard";
          }

          // Fetch churn risk from ML engine
          const churnRes = await fetch(
            `${ML_ENGINE_URL}/api/churn?recency_days=${recencyDays}&total_orders=${totalOrders}&total_spent=${totalSpent}&tenure_days=${tenureDays}`
          );
          if (churnRes.ok) {
            const churnJson = await churnRes.json();
            churnRisk = churnJson.dashboard_status || "Safe";
            churnScore = churnJson.churn_risk_score || 0;
          }
        } catch (mlErr) {
          console.warn(`ML predictions offline for customer ${customer.id}`);
        }

        return {
          id: customer.id,
          name: customer.name,
          email: customer.email,
          image: customer.image,
          createdAt: customer.createdAt,
          totalOrders,
          totalSpent,
          cohort,
          churnRisk,
          churnScore,
          tenureDays
        };
      })
    );

    return NextResponse.json({ success: true, data: populatedCustomers });
  } catch (error: any) {
    console.error("Error fetching merchant customers:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
