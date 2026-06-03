import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const ML_ENGINE_URL = process.env.ML_ENGINE_URL || "http://127.0.0.1:5000";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    if (!type) {
      return NextResponse.json({ success: false, error: "Missing type parameter" }, { status: 400 });
    }

    // 1. CHURN RISK PREDICTION
    if (type === "churn") {
      const buyerId = searchParams.get("buyer_id");
      if (!buyerId) {
        return NextResponse.json({ success: false, error: "Missing buyer_id" }, { status: 400 });
      }

      // Fetch user and order history from DB
      const [user, orders] = await Promise.all([
        prisma.user.findUnique({ where: { id: buyerId } }),
        prisma.orders.findMany({
          where: { user_id: buyerId },
          orderBy: { created_at: "desc" },
        }),
      ]);

      if (!user) {
        return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
      }

      const totalOrders = orders.length;
      const totalSpent = orders.reduce((sum, o) => sum + Number(o.total_amount), 0);

      const now = new Date();
      const userCreated = user.createdAt ? new Date(user.createdAt) : now;
      const tenureDays = Math.max(1, Math.ceil((now.getTime() - userCreated.getTime()) / (1000 * 60 * 60 * 24)));

      let recencyDays = tenureDays; // default to tenure if no orders
      if (totalOrders > 0 && orders[0].created_at) {
        const lastOrderDate = new Date(orders[0].created_at);
        recencyDays = Math.max(0, Math.ceil((now.getTime() - lastOrderDate.getTime()) / (1000 * 60 * 60 * 24)));
      }

      // Call Python FastAPI Churn API
      const pythonRes = await fetch(
        `${ML_ENGINE_URL}/api/churn?recency_days=${recencyDays}&total_orders=${totalOrders}&total_spent=${totalSpent}&tenure_days=${tenureDays}`
      );
      if (!pythonRes.ok) {
        throw new Error("FastAPI server churn endpoint returned an error");
      }
      const data = await pythonRes.json();
      return NextResponse.json({ success: true, data });
    }

    // 2. CUSTOMER SEGMENTATION
    if (type === "segment") {
      const buyerId = searchParams.get("buyer_id");
      if (!buyerId) {
        return NextResponse.json({ success: false, error: "Missing buyer_id" }, { status: 400 });
      }

      const [user, orders] = await Promise.all([
        prisma.user.findUnique({ where: { id: buyerId } }),
        prisma.orders.findMany({
          where: { user_id: buyerId },
          orderBy: { created_at: "desc" },
        }),
      ]);

      if (!user) {
        return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
      }

      const frequency = orders.length;
      const monetary = orders.reduce((sum, o) => sum + Number(o.total_amount), 0);
      const now = new Date();

      let recency = 90; // Default recency
      if (frequency > 0 && orders[0].created_at) {
        const lastOrderDate = new Date(orders[0].created_at);
        recency = Math.max(0, Math.ceil((now.getTime() - lastOrderDate.getTime()) / (1000 * 60 * 60 * 24)));
      }

      // Call Python FastAPI Segment API
      const pythonRes = await fetch(
        `${ML_ENGINE_URL}/api/segment/buyer?buyer_id=${buyerId}&recency=${recency}&frequency=${frequency}&monetary=${monetary}`
      );
      if (!pythonRes.ok) {
        throw new Error("FastAPI server segment endpoint returned an error");
      }
      const data = await pythonRes.json();
      return NextResponse.json({ success: true, data });
    }

    // 3. CROSS SELL (MARKET BASKET)
    if (type === "crosssell") {
      const categories = searchParams.get("categories") || "";
      const topN = searchParams.get("top_n") || "3";
      
      const pythonRes = await fetch(
        `${ML_ENGINE_URL}/api/crosssell?categories=${encodeURIComponent(categories)}&top_n=${topN}`
      );
      if (!pythonRes.ok) {
        throw new Error("FastAPI server crosssell endpoint returned an error");
      }
      const data = await pythonRes.json();
      return NextResponse.json({ success: true, data });
    }

    // 4. RECOMMENDATIONS (HYBRID)
    if (type === "recommend") {
      const buyerId = searchParams.get("buyer_id") || "";
      const productId = searchParams.get("product_id") || "";
      const topN = searchParams.get("top_n") || "4";

      let activeProductId = productId;
      if (buyerId && !activeProductId) {
        try {
          const latestOrder = await prisma.orders.findFirst({
            where: { user_id: buyerId },
            orderBy: { created_at: "desc" },
            include: {
              order_items: {
                take: 1,
              },
            },
          });
          if (latestOrder && latestOrder.order_items.length > 0 && latestOrder.order_items[0].product_id) {
            activeProductId = latestOrder.order_items[0].product_id;
          }
        } catch (dbErr) {
          console.error("Failed to fetch latest order for recommendations:", dbErr);
        }
      }

      const query = new URLSearchParams();
      if (buyerId) query.append("buyer_id", buyerId);
      if (activeProductId) query.append("product_id", activeProductId);
      query.append("top_n", topN);

      const pythonRes = await fetch(`${ML_ENGINE_URL}/api/recommend?${query.toString()}`);
      if (!pythonRes.ok) {
        throw new Error("FastAPI server recommend endpoint returned an error");
      }
      const data = await pythonRes.json();
      return NextResponse.json({ success: true, data });
    }


    // 5. DEMAND FORECAST
    if (type === "forecast") {
      const category = searchParams.get("category") || "Insecticides";
      const days = searchParams.get("days") || "30";

      const pythonRes = await fetch(`${ML_ENGINE_URL}/api/forecast?category=${encodeURIComponent(category)}&days=${days}`);
      if (!pythonRes.ok) {
        throw new Error("FastAPI server forecast endpoint returned an error");
      }
      const data = await pythonRes.json();
      return NextResponse.json({ success: true, data });
    }

    return NextResponse.json({ success: false, error: "Invalid type parameter" }, { status: 400 });
  } catch (error: any) {
    console.error("ML Route Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to process ML request" }, { status: 500 });
  }
}
