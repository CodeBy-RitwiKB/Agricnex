import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const configs = await prisma.system_configs.findMany();
    
    // Map array to object dictionary
    const configMap = configs.reduce((acc: any, c) => {
      acc[c.key] = c.value;
      return acc;
    }, {});

    // Provide default values if configuration keys don't exist yet
    const maintenanceMode = configMap["maintenanceMode"] !== undefined ? configMap["maintenanceMode"] : false;
    const commission = configMap["commission"] !== undefined ? Number(configMap["commission"]) : 5;
    const announcement = configMap["announcement"] !== undefined ? String(configMap["announcement"]) : "Kharif Season Sale is Live! Get 20% off on all fertilizers.";
    const maxImageSize = configMap["maxImageSize"] !== undefined ? Number(configMap["maxImageSize"]) : 5;
    const apiCacheDuration = configMap["apiCacheDuration"] !== undefined ? Number(configMap["apiCacheDuration"]) : 3600;

    return NextResponse.json({
      success: true,
      config: {
        maintenanceMode,
        commission,
        announcement,
        maxImageSize,
        apiCacheDuration
      }
    });
  } catch (error: any) {
    console.error("Error fetching system configs:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { maintenanceMode, commission, announcement, maxImageSize, apiCacheDuration } = await req.json();

    const updates = [
      { key: "maintenanceMode", value: maintenanceMode },
      { key: "commission", value: Number(commission) },
      { key: "announcement", value: announcement },
      { key: "maxImageSize", value: Number(maxImageSize) },
      { key: "apiCacheDuration", value: Number(apiCacheDuration) }
    ];

    // Upsert each parameter in the system_configs table
    for (const item of updates) {
      await prisma.system_configs.upsert({
        where: { key: item.key },
        update: { value: item.value, updated_at: new Date() },
        create: { key: item.key, value: item.value }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error updating system configs:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
