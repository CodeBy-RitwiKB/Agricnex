import { NextResponse } from "next/server";

const ML_ENGINE_URL = process.env.ML_ENGINE_URL || "http://127.0.0.1:5000";

// Standard historical demand baseline per category
const DEMAND_BASELINES: Record<string, number> = {
  "Insecticides": 25.0,
  "Nutrients": 35.0,
  "Vegetable & Fruit Seeds": 40.0,
  "Growth Promoters": 20.0,
  "Farm Machinery": 5.0,
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || "Insecticides";
    const basePrice = Number(searchParams.get("price")) || 100;

    // 1. Fetch the demand forecast from the FastAPI model
    let pythonRes = await fetch(`${ML_ENGINE_URL}/api/forecast?category=${encodeURIComponent(category)}&days=30`);
    if (!pythonRes.ok) {
      // Fallback to a standard category to prevent crashing if the model doesn't support the requested category (e.g. 'Offers')
      pythonRes = await fetch(`${ML_ENGINE_URL}/api/forecast?category=${encodeURIComponent("Insecticides")}&days=30`);
    }
    if (!pythonRes.ok) {
      throw new Error("Failed to fetch demand forecast from backend model");
    }
    const data = await pythonRes.json();
    const forecasts = data.forecast || [];

    if (forecasts.length === 0) {
      return NextResponse.json({ success: true, suggestedPrice: basePrice, markupPercent: 0, reason: "No forecast data available." });
    }

    // 2. Calculate trend-based baseline (first 7 days) and target (last 7 days)
    const firstWeek = forecasts.slice(0, 7);
    const lastWeek = forecasts.slice(-7);
    
    const baseline = firstWeek.reduce((sum: number, f: any) => sum + f.yhat, 0) / firstWeek.length;
    const futureDemand = lastWeek.reduce((sum: number, f: any) => sum + f.yhat, 0) / lastWeek.length;
    
    const ratio = baseline > 0 ? (futureDemand / baseline) : 1.0;
    const avgForecast = forecasts.reduce((sum: number, f: any) => sum + f.yhat, 0) / forecasts.length;
    let markupPercent = 0;
    let reason = "Demand is stable. Maintain standard pricing.";

    const now = new Date();
    const currentMonth = now.getMonth() + 1; // 1-indexed (Jan = 1, Dec = 12)
    const isKharif = currentMonth >= 6 && currentMonth <= 9;
    const isRabi = currentMonth >= 10 || currentMonth <= 2;

    if (ratio > 1.25) {
      markupPercent = 10;
      reason = `Peak demand period detected (Forecasted demand is ${Math.round((ratio - 1) * 100)}% above baseline). Dynamic markup of +10% recommended to optimize revenue.`;
    } else if (ratio > 1.10) {
      markupPercent = 5;
      reason = `Moderate demand increase forecasted (+${Math.round((ratio - 1) * 100)}% above baseline). Suggesting +5% seasonal adjustment.`;
    } else if (ratio < 0.75) {
      markupPercent = -10;
      reason = `Off-season low demand detected (Forecasted demand is ${Math.round((1 - ratio) * 100)}% below baseline). Recommended promotional discount of -10% to clear inventory.`;
    } else if (ratio < 0.90) {
      markupPercent = -5;
      reason = `Slight demand decrease forecasted. Suggesting a small discount of -5% to encourage volume sales.`;
    }

    // Adjust for specific agricultural seasons
    if (isKharif && (category === "Vegetable & Fruit Seeds" || category === "Growth Promoters")) {
      markupPercent += 2;
      reason += " Additional Kharif crop sowing season surcharge applied.";
    } else if (isRabi && (category === "Insecticides" || category === "Nutrients")) {
      markupPercent += 2;
      reason += " Additional Rabi season cultivation surcharge applied.";
    }

    const priceAdjustment = basePrice * (markupPercent / 100);
    const suggestedPrice = Math.round((basePrice + priceAdjustment) * 100) / 100;

    return NextResponse.json({
      success: true,
      category,
      basePrice,
      suggestedPrice,
      markupPercent,
      avgForecast: Math.round(avgForecast * 10) / 10,
      baseline,
      reason,
    });
  } catch (error: any) {
    console.error("Smart Dynamic Pricing API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
