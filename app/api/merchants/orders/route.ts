import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const MOCK_ORDERS = [
    { customerName: "Rajesh Singh", location: "Punjab, India", amount: 12450.00, status: "In Transit" },
    { customerName: "Amit Kumar", location: "Haryana, India", amount: 3500.00, status: "Completed" },
    { customerName: "Vijay Patel", location: "Gujarat, India", amount: 24900.00, status: "New" },
    { customerName: "Mahesh Sharma", location: "Rajasthan, India", amount: 8900.00, status: "Completed" },
    { customerName: "Sanjay Lal", location: "Uttar Pradesh, India", amount: 15600.00, status: "In Transit" },
];

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // Get the merchant record for this user
    let merchant = await prisma.merchants.findUnique({
      where: { user_id: session.user.id }
    });

    // If merchant record doesn't exist, create it dynamically
    if (!merchant) {
      merchant = await prisma.merchants.create({
        data: {
          user_id: session.user.id,
          store_name: `${session.user.name || 'Green Valley'} Store`,
          business_type: "Retailer",
        }
      });
      // also ensure user role is updated to merchant
      await prisma.user.update({
        where: { id: session.user.id },
        data: { role: "merchant" }
      });
    }

    // Fetch all products for this merchant
    let products = await prisma.products.findMany({
      where: { merchant_id: merchant.id }
    });

    // If no products, let's create a placeholder product so we can link orders to it
    if (products.length === 0) {
      const category = await prisma.categories.findFirst();
      const newProduct = await prisma.products.create({
        data: {
          merchant_id: merchant.id,
          category_id: category?.id || null,
          name: "Premium Organic Urea",
          description: "High quality nitrogen fertilizer for vegetable crops.",
          price: 450.00,
          unit: "kg",
          stock_quantity: 100,
          status: "active",
        }
      });
      products = [newProduct];
    }

    // Check if there are any orders for this merchant
    let orders = await prisma.orders.findMany({
      where: {
        order_items: {
          some: {
            products: {
              merchant_id: merchant.id
            }
          }
        }
      },
      include: {
        users: {
          select: {
            name: true,
            email: true,
          }
        },
        order_items: {
          include: {
            products: {
              select: {
                name: true,
                price: true,
                image_url: true,
              }
            }
          }
        }
      },
      orderBy: {
        created_at: "desc"
      }
    });

    // AUTO-SEEDING: If no orders exist, seed the mock orders in the database
    if (orders.length === 0) {
      console.log("No orders found. Seeding mock orders in DB...");
      
      for (let i = 0; i < MOCK_ORDERS.length; i++) {
        const mock = MOCK_ORDERS[i];
        
        // 1. Create a dummy customer user
        const email = `customer_${i}_${Date.now()}@agrinex.com`;
        const customer = await prisma.user.create({
          data: {
            name: mock.customerName,
            email: email,
            role: "customer",
          }
        });

        // 2. Create the order
        const order = await prisma.orders.create({
          data: {
            user_id: customer.id,
            total_amount: mock.amount,
            // @ts-ignore
            status: mock.status === "In Transit" ? "shipped" : mock.status === "New" ? "pending" : "delivered",
            payment_status: "paid",
            payment_method: "UPI",
            shipping_address: mock.location,
          }
        });

        // 3. Create the order item linked to the merchant's product
        const productToLink = products[i % products.length];
        await prisma.order_items.create({
          data: {
            order_id: order.id,
            product_id: productToLink.id,
            quantity: Math.max(1, Math.floor(mock.amount / Number(productToLink.price))),
            price_at_purchase: productToLink.price,
          }
        });
      }

      // Re-fetch orders now that they are seeded
      orders = await prisma.orders.findMany({
        where: {
          order_items: {
            some: {
              products: {
                merchant_id: merchant.id
              }
            }
          }
        },
        include: {
          users: {
            select: {
              name: true,
              email: true,
            }
          },
          order_items: {
            include: {
              products: {
                select: {
                  name: true,
                  price: true,
                  image_url: true,
                }
              }
            }
          }
        },
        orderBy: {
          created_at: "desc"
        }
      });
    }

    return NextResponse.json({ success: true, data: orders });
  } catch (error: any) {
    console.error("Error fetching/seeding merchant orders:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
