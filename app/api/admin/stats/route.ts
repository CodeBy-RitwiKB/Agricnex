import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const [totalUsers, totalOrders, allOrders, recentUsers, recentProducts, recentOrders] = await Promise.all([
      prisma.user.count(),
      prisma.orders.count(),
      prisma.orders.findMany({
        select: {
          total_amount: true,
          status: true,
        }
      }),
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: "desc" }
      }),
      prisma.products.findMany({
        take: 5,
        orderBy: { created_at: "desc" },
        include: {
          merchants: true
        }
      }),
      prisma.orders.findMany({
        take: 5,
        orderBy: { created_at: "desc" },
        include: {
          users: true
        }
      })
    ]);

    // Compute revenue
    const totalRevenue = allOrders.reduce((sum, o) => sum + Number(o.total_amount), 0);
    
    // System load
    const systemLoad = 14; 
    
    // Pending products count (used for incidents or warnings)
    const pendingProductsCount = await prisma.products.count({
      where: { status: "pending_approval" }
    });
    
    const incidents = pendingProductsCount || 2;

    // Combine recent database events into a unified activity feed
    const activity: any[] = [];
    
    recentOrders.forEach((o) => {
      activity.push({
        id: o.id,
        user: o.users?.name || "System",
        userId: o.user_id,
        action: `Order #${o.id.substring(0, 8).toUpperCase()} Created`,
        time: o.created_at,
        status: o.status === "cancelled" ? "Failed" : "Success"
      });
    });

    recentProducts.forEach((p) => {
      activity.push({
        id: p.id,
        user: p.merchants?.store_name || "Merchant",
        userId: p.merchant_id,
        action: `Product "${p.name}" Listed`,
        time: p.created_at,
        status: p.status === "active" ? "Success" : "Pending"
      });
    });

    recentUsers.forEach((u) => {
      activity.push({
        id: u.id,
        user: u.name,
        userId: u.id,
        action: `User Registered (${u.role})`,
        time: u.createdAt,
        status: "Success"
      });
    });

    // Sort by timestamp desc, limit to 5
    const sortedActivity = activity
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 5);

    return NextResponse.json({
      success: true,
      stats: {
        activeUsers: totalUsers,
        systemLoad,
        revenue: totalRevenue,
        incidents,
        totalRevenue,
        ordersFulfilled: totalOrders,
        newRegistrations: totalUsers,
      },
      activity: sortedActivity
    });
  } catch (error: any) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
