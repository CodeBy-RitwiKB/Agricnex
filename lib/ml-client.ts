/**
 * Agrinex ML Engine Client
 * 
 * Reusable helper utility to query the FastAPI machine learning endpoints.
 * Since Next.js proxy handles rewrite from '/api/ml/*' to 'http://127.0.0.1:5000/api/*',
 * this client uses standard relative fetch endpoints.
 */

export interface HealthResponse {
  status: string;
  timestamp: string;
  models_loaded: string[];
  forecast_cats: string[];
  products_in_db: number;
}

export interface ForecastPoint {
  ds: string;
  yhat: number;
  yhat_lower: number;
  yhat_upper: number;
}

export interface ForecastResponse {
  category: string;
  days: number;
  source: string;
  forecast: ForecastPoint[];
}

export interface RecommendedProduct {
  product_id: string;
  product_name?: string;
  category?: string;
  price?: number;
  image_url?: string;
}

export interface RecommendResponse {
  buyer_id: string | null;
  product_id: string | null;
  source: string;
  alpha: number | null;
  recommended: RecommendedProduct[];
}

export interface CohortSummary {
  cohort: string;
  count: number;
  avg_recency: number;
  avg_freq: number;
  avg_spend: number;
}

export interface SegmentsResponse {
  total_buyers: number;
  cohorts: CohortSummary[];
}

export interface SegmentBuyerResponse {
  buyer_id: string;
  recency: number;
  frequency: number;
  monetary: number;
  cluster: number;
  cohort: string;
}

export interface CrossSellRule {
  if_buying: string;
  also_buy: string;
  lift: number;
  confidence: number;
}

export interface CrossSellResponse {
  cart_categories: string[];
  suggested_categories: string[];
  products: RecommendedProduct[];
  rules_applied: CrossSellRule[];
}

export interface ChurnInputs {
  recency_days: number;
  total_orders: number;
  total_spent: number;
  tenure_days: number;
  avg_order_value: number;
}

export interface ChurnResponse {
  inputs_received: ChurnInputs;
  churn_risk_score: number;
  churn_risk_percentage: string;
  dashboard_status: "Safe" | "Medium Risk" | "High Risk";
}

class MlEngineClient {
  private basePath = "/api/ai/ml";

  /**
   * Health Check of ML Engine
   */
  async getHealth(): Promise<HealthResponse> {
    const res = await fetch("/api/ml/health");
    if (!res.ok) throw new Error("Failed to fetch ML engine health status");
    return res.json();
  }

  /**
   * 1. Demand Forecast per Category
   */
  async getForecast(category: string, days: 30 | 60 | 90 = 30): Promise<ForecastResponse> {
    const res = await fetch(`${this.basePath}?type=forecast&category=${encodeURIComponent(category)}&days=${days}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Unknown error" }));
      throw new Error(err.error || "Failed to fetch demand forecast");
    }
    const result = await res.json();
    return result.data;
  }

  /**
   * 2. Hybrid Recommendation (collaboration filtering + content based)
   */
  async getRecommendations(params: { buyerId?: string; productId?: string; topN?: number }): Promise<RecommendResponse> {
    const { buyerId, productId, topN = 4 } = params;
    const query = new URLSearchParams({ type: "recommend" });
    if (buyerId) query.append("buyer_id", buyerId);
    if (productId) query.append("product_id", productId);
    query.append("top_n", topN.toString());

    const res = await fetch(`${this.basePath}?${query.toString()}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Unknown error" }));
      throw new Error(err.error || "Failed to fetch product recommendations");
    }
    const result = await res.json();
    return result.data;
  }

  /**
   * 3a. Customer Cohorts/Segments Summary
   */
  async getSegments(): Promise<SegmentsResponse> {
    const res = await fetch("/api/ml/segments");
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Unknown error" }));
      throw new Error(err.detail || "Failed to fetch RFM segments list");
    }
    return res.json();
  }

  /**
   * 3b. Predict segment for a specific buyer (automatically resolved from DB)
   */
  async predictBuyerSegment(buyerId: string): Promise<SegmentBuyerResponse> {
    const res = await fetch(`${this.basePath}?type=segment&buyer_id=${buyerId}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Unknown error" }));
      throw new Error(err.error || "Failed to predict buyer segment");
    }
    const result = await res.json();
    return result.data;
  }

  /**
   * 4. Market Basket Cross-Sell suggestions
   */
  async getCrossSell(categories: string[], topN = 3): Promise<CrossSellResponse> {
    const res = await fetch(`${this.basePath}?type=crosssell&categories=${encodeURIComponent(categories.join(","))}&top_n=${topN}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Unknown error" }));
      throw new Error(err.error || "Failed to fetch cross-sell categories");
    }
    const result = await res.json();
    return result.data;
  }

  /**
   * 5. Predict Churn risk for a buyer (automatically resolved from DB)
   */
  async predictChurnRisk(buyerId: string): Promise<ChurnResponse> {
    const res = await fetch(`${this.basePath}?type=churn&buyer_id=${buyerId}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Unknown error" }));
      throw new Error(err.error || "Failed to compute customer churn risk");
    }
    const result = await res.json();
    return result.data;
  }
}

export const mlClient = new MlEngineClient();
