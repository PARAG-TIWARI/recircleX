import { ApiClient } from "./client";

export interface MarketplaceListingItem {
  id: string;
  seller_id: string;
  inventory_id: string;
  material: string;
  category: string;
  title: string;
  description?: string;
  images: string[];
  quantity: number;
  unit: string;
  quality: string;
  price_per_unit: number;
  total_value: number;
  location?: {
    city?: string;
    postal_code?: string;
    street_address?: string;
  };
  status: "ACTIVE" | "RESERVED" | "SOLD" | "CANCELLED";
  created_at: string;
  updated_at: string;
  seller_name?: string;
  seller_is_verified: boolean;
  seller_rating: number;
  seller_service_area?: string;
  estimated_co2_kg: number;
}

export interface MarketplaceListingList {
  items: MarketplaceListingItem[];
  total: number;
}

export interface CreateListingPayload {
  inventory_id: string;
  title: string;
  description?: string;
  price_per_unit: number;
  quality?: string;
  location?: Record<string, any>;
}

export interface AIListingEnhancePayload {
  material: string;
  quantity: number;
  unit?: string;
  quality?: string;
  category?: string;
}

export interface AIListingEnhanceResult {
  enhanced_title: string;
  technical_description: string;
  quality_summary: string;
  suggested_price_per_unit: number;
}

export const marketplaceApi = {
  getListings: async (params?: {
    category?: string;
    material?: string;
    quality?: string;
    city?: string;
    search?: string;
    sort_by?: string;
    status_filter?: string;
    limit?: number;
    skip?: number;
  }): Promise<MarketplaceListingList> => {
    const q = new URLSearchParams();
    if (params?.category) q.set("category", params.category);
    if (params?.material) q.set("material", params.material);
    if (params?.quality) q.set("quality", params.quality);
    if (params?.city) q.set("city", params.city);
    if (params?.search) q.set("search", params.search);
    if (params?.sort_by) q.set("sort_by", params.sort_by);
    if (params?.status_filter) q.set("status_filter", params.status_filter);
    if (params?.limit) q.set("limit", params.limit.toString());
    if (params?.skip) q.set("skip", params.skip.toString());

    const res = await ApiClient.get<MarketplaceListingList>(`/api/v1/marketplace/listings?${q.toString()}`);
    if (!res.success || !res.data) return { items: [], total: 0 };
    return res.data;
  },

  getListingDetail: async (id: string): Promise<MarketplaceListingItem> => {
    const res = await ApiClient.get<MarketplaceListingItem>(`/api/v1/marketplace/listings/${id}`);
    if (!res.success || !res.data) throw new Error(res.message || "Failed to load listing details");
    return res.data;
  },

  createListing: async (payload: CreateListingPayload): Promise<MarketplaceListingItem> => {
    const res = await ApiClient.post<MarketplaceListingItem>("/api/v1/marketplace/listings", payload);
    if (!res.success || !res.data) throw new Error(res.message || "Failed to publish listing");
    return res.data;
  },

  reserveListing: async (id: string, payload?: { notes?: string; delivery_address?: any }) => {
    const res = await ApiClient.post(`/api/v1/marketplace/listings/${id}/reserve`, payload || {});
    if (!res.success || !res.data) throw new Error(res.message || "Failed to reserve material");
    return res.data;
  },

  aiEnhance: async (payload: AIListingEnhancePayload): Promise<AIListingEnhanceResult> => {
    const res = await ApiClient.post<AIListingEnhanceResult>("/api/v1/marketplace/ai-enhance", payload);
    if (!res.success || !res.data) {
      return {
        enhanced_title: `${payload.quality || "Standard"} Grade ${payload.material}`,
        technical_description: `Segregated batch of ${payload.material} ready for recycling.`,
        quality_summary: `Pre-sorted ${payload.quality || "Standard"} grade stock.`,
        suggested_price_per_unit: 32.0,
      };
    }
    return res.data;
  },
};
