import { ApiClient } from "./client";

export interface ListingItem {
  id: string;
  owner_id: string;
  material: string;
  category: string;
  title: string;
  description?: string;
  images: string[];
  quantity: number;
  unit: string;
  quality: string;
  ai_analysis_id?: string;
  estimated_price?: number;
  estimated_price_range?: string;
  location?: {
    street?: string;
    city?: string;
    postal_code?: string;
  };
  status: "AVAILABLE" | "PICKUP_REQUESTED" | "SCHEDULED" | "COLLECTED" | "CANCELLED";
  created_at: string;
  updated_at: string;
}

export interface CreateListingPayload {
  material: string;
  category: string;
  title: string;
  description?: string;
  images: string[];
  quantity: number;
  unit?: string;
  quality?: string;
  ai_analysis_id?: string;
  estimated_price?: number;
  estimated_price_range?: string;
  location?: Record<string, any>;
}

export const listingsApi = {
    getMaterials: async (): Promise<Record<string, { category: string; rate: number; unit: string; co2_factor: number }>> => {
    const res = await ApiClient.get<Record<string, { category: string; rate: number; unit: string; co2_factor: number }>>("/api/v1/listings/materials");
    if (!res.success || !res.data) return {};
    return res.data;
  },

  createListing: async (data: CreateListingPayload): Promise<ListingItem> => {
    const res = await ApiClient.post<ListingItem>("/api/v1/listings", data);
    if (!res.success || !res.data) throw new Error(res.message || "Failed to create listing");
    return res.data;
  },

  getMyListings: async (limit = 50, skip = 0): Promise<{ items: ListingItem[]; total: number }> => {
    const res = await ApiClient.get<{ items: ListingItem[]; total: number }>(
      `/api/v1/listings/my?limit=${limit}&skip=${skip}`
    );
    if (!res.success || !res.data) return { items: [], total: 0 };
    return res.data;
  },

  getListing: async (id: string): Promise<ListingItem> => {
    const res = await ApiClient.get<ListingItem>(`/api/v1/listings/${id}`);
    if (!res.success || !res.data) throw new Error(res.message || "Listing not found");
    return res.data;
  },

  updateListing: async (
    id: string,
    data: Partial<CreateListingPayload> & { status?: string }
  ): Promise<ListingItem> => {
    const res = await ApiClient.patch<ListingItem>(`/api/v1/listings/${id}`, data);
    if (!res.success || !res.data) throw new Error(res.message || "Failed to update listing");
    return res.data;
  },

  deleteListing: async (id: string): Promise<boolean> => {
    const res = await ApiClient.delete<boolean>(`/api/v1/listings/${id}`);
    return res.success;
  },
};
