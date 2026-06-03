import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { userId, storeName, businessType } = body;

        if (!userId || !storeName) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Transactionally create the merchant profile and update the user's role in the DB to 'merchant'
        const [merchant] = await prisma.$transaction([
            prisma.merchants.create({
                data: {
                    user_id: userId,
                    store_name: storeName,
                    business_type: businessType,
                    status: "standard",
                    is_verified: false,
                }
            }),
            prisma.user.update({
                where: { id: userId },
                data: { role: "merchant" }
            })
        ]);

        return NextResponse.json(merchant);
    } catch (error: any) {
        console.error("Error creating merchant:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
