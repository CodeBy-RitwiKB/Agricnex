import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const now = new Date();

    const [pendingAuditCount, verifiedMerchantsCount, autoBlockedCount, pendingProducts, unverifiedMerchants, flaggedReviews] = await Promise.all([
      // Pending Audit: Count of products pending approval
      prisma.products.count({
        where: { status: "pending_approval" }
      }),
      // Verified Sellers: Count of verified merchants
      prisma.merchants.count({
        where: { is_verified: true }
      }),
      // Auto-Blocked: Count of locked accounts
      prisma.user.count({
        where: {
          lockedUntil: {
            gt: now
          }
        }
      }),
      // Fetch actual products pending approval
      prisma.products.findMany({
        where: { status: "pending_approval" },
        include: { merchants: true },
        take: 10
      }),
      // Fetch actual unverified merchants
      prisma.merchants.findMany({
        where: { is_verified: false },
        include: { users: true },
        take: 10
      }),
      // Fetch reviews with ratings <= 2
      prisma.reviews.findMany({
        where: { rating: { lte: 2 } },
        include: { products: true, users: true },
        take: 10
      })
    ]);

    // Build the queue items
    const queue: any[] = [];

    pendingProducts.forEach((p) => {
      queue.push({
        id: p.id,
        type: "Product Listing",
        entity: p.name,
        reason: `Pending approval (Listed by ${p.merchants?.store_name || "Merchant"})`,
        priority: "High",
        dbType: "product"
      });
    });

    unverifiedMerchants.forEach((m) => {
      queue.push({
        id: m.id,
        type: "Seller Identity",
        entity: m.store_name,
        reason: `GSTIN: ${m.gstin || "N/A"}. Needs verification of corporate credentials.`,
        priority: "Medium",
        dbType: "merchant"
      });
    });

    flaggedReviews.forEach((r) => {
      queue.push({
        id: r.id,
        type: "User Review",
        entity: `Review for ${r.products?.name || "Product"}`,
        reason: `Flagged due to low rating (${r.rating}/5 stars). Comment: "${r.comment || "No comment"}"`,
        priority: "Critical",
        dbType: "review"
      });
    });

    return NextResponse.json({
      success: true,
      stats: {
        pendingAudit: pendingAuditCount,
        reportedItems: flaggedReviews.length,
        verifiedSellers: verifiedMerchantsCount,
        autoBlocked: autoBlockedCount
      },
      queue
    });
  } catch (error: any) {
    console.error("Error fetching moderation items:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { action, id, dbType } = await req.json();
    
    if (action === "approve") {
      if (dbType === "product") {
        await prisma.products.update({
          where: { id },
          data: { status: "active" }
        });
      } else if (dbType === "merchant") {
        await prisma.merchants.update({
          where: { id },
          data: { is_verified: true }
        });
      }
    } else if (action === "reject" || action === "dismiss") {
      if (dbType === "product") {
        await prisma.products.update({
          where: { id },
          data: { status: "inactive" }
        });
      } else if (dbType === "merchant") {
        // Can reject/suspend store or standard status
        await prisma.merchants.update({
          where: { id },
          data: { is_verified: false }
        });
      } else if (dbType === "review") {
        await prisma.reviews.delete({
          where: { id }
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error processing moderation action:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
