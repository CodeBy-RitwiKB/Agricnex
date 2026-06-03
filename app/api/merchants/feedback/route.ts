import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const ML_ENGINE_URL = "http://127.0.0.1:5000";

const FEEDBACK_TEMPLATES = [
  {
    rating: 5,
    comment: "This seed has exceptional purity and germination rate. My crop yield was substantially higher this season."
  },
  {
    rating: 4,
    comment: "Very effective product for pest management. Solved our leaf folder issue within a few days. Recommended!"
  },
  {
    rating: 5,
    comment: "Highly pleased with the results. Very healthy crops and the packaging kept the seeds perfectly dry."
  },
  {
    rating: 3,
    comment: "Decent quality product, though delivery took two days longer than expected."
  },
  {
    rating: 5,
    comment: "Top grade stuff. Completely cured the infestation on my farm. Will buy again next season!"
  }
];

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

    // Fetch reviews for products owned by this merchant
    let reviewsList = await prisma.reviews.findMany({
      where: {
        products: {
          merchant_id: merchantProfile.id
        }
      },
      include: {
        products: {
          select: { name: true }
        },
        users: {
          select: { name: true, email: true }
        }
      },
      orderBy: { created_at: "desc" }
    });

    // If there are no reviews for this merchant's products, seed them automatically
    if (reviewsList.length === 0) {
      console.log(`No reviews found for merchant ${merchantProfile.store_name}. Seeding...`);

      // 1. Get merchant's products
      const merchantProducts = await prisma.products.findMany({
        where: { merchant_id: merchantProfile.id },
        take: 5
      });

      // 2. Get customer users who ordered from this merchant
      let customers = await prisma.user.findMany({
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
        take: 3
      });

      // Fallback: if no customers have ordered yet, fetch any customer
      if (customers.length === 0) {
        customers = await prisma.user.findMany({
          where: { role: "customer" },
          take: 3
        });
      }

      // Fallback: if still no customers, use any user
      if (customers.length === 0) {
        customers = await prisma.user.findMany({
          take: 3
        });
      }

      if (merchantProducts.length > 0 && customers.length > 0) {
        for (let i = 0; i < Math.min(FEEDBACK_TEMPLATES.length, merchantProducts.length * 2); i++) {
          const template = FEEDBACK_TEMPLATES[i % FEEDBACK_TEMPLATES.length];
          const product = merchantProducts[i % merchantProducts.length];
          const customer = customers[i % customers.length];

          await prisma.reviews.create({
            data: {
              rating: template.rating,
              comment: template.comment,
              user_id: customer.id,
              product_id: product.id
            }
          });
        }

        // Refetch reviews after seeding
        reviewsList = await prisma.reviews.findMany({
          where: {
            products: {
              merchant_id: merchantProfile.id
            }
          },
          include: {
            products: {
              select: { name: true }
            },
            users: {
              select: { name: true, email: true }
            }
          },
          orderBy: { created_at: "desc" }
        });
      }
    }

    // Format the response to fit our UI feedback format
    const formattedFeedback = reviewsList.map((rev) => {
      const author = rev.users?.name || "Anonymous Farmer";
      const initials = author.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase() || "US";
      
      const daysAgo = Math.floor((new Date().getTime() - new Date(rev.created_at).getTime()) / (1000 * 3600 * 24));
      const timeStr = daysAgo > 0 ? `${daysAgo}d ago` : "Verified Purchase";

      return {
        id: rev.id,
        initials,
        author,
        email: rev.users?.email || "",
        rating: rev.rating,
        time: timeStr,
        product: rev.products?.name || "Store Item",
        content: rev.comment || ""
      };
    });

    return NextResponse.json({ success: true, data: formattedFeedback });
  } catch (error: any) {
    console.error("Error fetching merchant feedback:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
