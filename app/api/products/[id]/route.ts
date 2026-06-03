import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const product = await prisma.products.findUnique({
      where: { id },
      include: {
        categories: {
          select: {
            id: true,
            name: true,
            image_url: true,
          },
        },
        merchants: {
          select: {
            id: true,
            store_name: true,
          },
        },
        _count: {
          select: { reviews: true }
        }
      },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    // Format product (convert Decimal to Number)
    const formattedProduct = {
      ...product,
      price: Number(product.price),
      originalPrice: Number(product.price) * 1.2, // Fake MRP for UI
      rating: 4.5 + (Math.random() * 0.4), // Placeholder rating
      reviews: product._count.reviews || Math.floor(Math.random() * 500) + 10,
    };

    return NextResponse.json({
      success: true,
      data: formattedProduct,
    });
  } catch (error: any) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
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
      return NextResponse.json({ success: false, error: "Merchant profile not found" }, { status: 403 });
    }

    const product = await prisma.products.findUnique({
      where: { id }
    });
    if (!product) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    }
    
    // Bypass ownership check for admin, otherwise check ownership
    if (session.user.role !== "admin" && product.merchant_id !== merchantProfile.id) {
      return NextResponse.json({ success: false, error: "Forbidden: You do not own this product" }, { status: 403 });
    }

    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.price !== undefined) updateData.price = Number(body.price);
    if (body.stock_quantity !== undefined) updateData.stock_quantity = Number(body.stock_quantity);
    if (body.status !== undefined) updateData.status = body.status;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.unit !== undefined) updateData.unit = body.unit;

    const updatedProduct = await prisma.products.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({ success: true, data: updatedProduct });
  } catch (error: any) {
    console.error("Error updating product:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
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
      return NextResponse.json({ success: false, error: "Merchant profile not found" }, { status: 403 });
    }

    const product = await prisma.products.findUnique({
      where: { id }
    });
    if (!product) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    }
    
    if (session.user.role !== "admin" && product.merchant_id !== merchantProfile.id) {
      return NextResponse.json({ success: false, error: "Forbidden: You do not own this product" }, { status: 403 });
    }

    await prisma.products.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: "Product deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting product:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

