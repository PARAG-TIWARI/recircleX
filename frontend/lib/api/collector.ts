import { ApiClient } from "./client";

export interface CollectorDashboardStats {
  new_pickup_requests_count: number;
  todays_pickups_count: number;
  active_pickup_count: number;
  completed_pickups_count: number;
  current_inventory_kg: number;
  estimated_inventory_value_inr: number;
}

export interface CollectorPickupItem {
  id: string;
  listing_id: string;
  household_id: string;
  collector_id?: string;
  address_id?: string;
  address_snapshot?: {
    label?: string;
    street_address?: string;
    city?: string;
    postal_code?: string;
    landmark?: string;
    contact_phone?: string;
  };
  preferred_time: string;
  status: "REQUESTED" | "ASSIGNED" | "ON_THE_WAY" | "COLLECTED" | "CANCELLED";
  notes?: string;
  actual_weight?: number;
  final_amount?: number;
  assigned_at?: string;
  started_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  listing_title?: string;
  material?: string;
  category?: string;
  quantity?: number;
  unit?: string;
  estimated_price_range?: string;
  images: string[];
  location_area?: string;
}

export interface CollectorInventoryItem {
  id: string;
  collector_id: string;
  source_listing_id?: string;
  pickup_id?: string;
  material: string;
  category: string;
  quantity: number;
  unit: string;
  quality: string;
  images: string[];
  estimated_value?: number;
  status: "AVAILABLE" | "LISTED" | "RESERVED" | "SOLD";
  created_at: string;
  updated_at: string;
}

export interface CollectorInventoryList {
  items: CollectorInventoryItem[];
  total: number;
  total_weight_kg: number;
  total_estimated_value: number;
}

export interface CollectorProfile {
  user_id: string;
  name?: string;
  phone?: string;
  avatar_url?: string;
  service_area?: string;
  is_verified: boolean;
  rating: number;
  total_pickups: number;
  location?: Record<string, any>;
}

export const collectorApi = {
  getDashboardStats: async (): Promise<CollectorDashboardStats> => {
    const res = await ApiClient.get<CollectorDashboardStats>("/api/v1/collector/dashboard");
    if (!res.success || !res.data) {
      return {
        new_pickup_requests_count: 0,
        todays_pickups_count: 0,
        active_pickup_count: 0,
        completed_pickups_count: 0,
        current_inventory_kg: 0,
        estimated_inventory_value_inr: 0,
      };
    }
    return res.data;
  },

  getPickups: async (tab = "available", limit = 50, skip = 0): Promise<{ items: CollectorPickupItem[]; total: number }> => {
    const res = await ApiClient.get<{ items: CollectorPickupItem[]; total: number }>(
      `/api/v1/collector/pickups?tab=${tab}&limit=${limit}&skip=${skip}`
    );
    if (!res.success || !res.data) return { items: [], total: 0 };
    return res.data;
  },

  getPickupDetail: async (id: string): Promise<CollectorPickupItem> => {
    const res = await ApiClient.get<CollectorPickupItem>(`/api/v1/collector/pickups/${id}`);
    if (!res.success || !res.data) throw new Error(res.message || "Failed to load pickup");
    return res.data;
  },

  acceptPickup: async (id: string): Promise<CollectorPickupItem> => {
    const res = await ApiClient.post<CollectorPickupItem>(`/api/v1/collector/pickups/${id}/accept`);
    if (!res.success || !res.data) throw new Error(res.message || "Failed to accept pickup");
    return res.data;
  },

  startPickup: async (id: string): Promise<CollectorPickupItem> => {
    const res = await ApiClient.post<CollectorPickupItem>(`/api/v1/collector/pickups/${id}/start`);
    if (!res.success || !res.data) throw new Error(res.message || "Failed to start pickup");
    return res.data;
  },

  completePickup: async (
    id: string,
    payload: { actual_weight?: number; final_amount?: number; notes?: string }
  ): Promise<CollectorPickupItem> => {
    const res = await ApiClient.post<CollectorPickupItem>(`/api/v1/collector/pickups/${id}/complete`, payload);
    if (!res.success || !res.data) throw new Error(res.message || "Failed to complete pickup");
    return res.data;
  },

  getInventory: async (limit = 100, skip = 0): Promise<CollectorInventoryList> => {
    const res = await ApiClient.get<CollectorInventoryList>(
      `/api/v1/collector/inventory?limit=${limit}&skip=${skip}`
    );
    if (!res.success || !res.data) {
      return { items: [], total: 0, total_weight_kg: 0, total_estimated_value: 0 };
    }
    return res.data;
  },

  getProfile: async (): Promise<CollectorProfile> => {
    const res = await ApiClient.get<CollectorProfile>("/api/v1/collector/profile");
    if (!res.success || !res.data) {
      return {
        user_id: "",
        name: "Collection Partner",
        is_verified: false,
        rating: 4.9,
        total_pickups: 0,
      };
    }
    return res.data;
  },

  updateProfile: async (data: Partial<CollectorProfile>): Promise<CollectorProfile> => {
    const res = await ApiClient.patch<CollectorProfile>("/api/v1/collector/profile", data);
    if (!res.success || !res.data) throw new Error(res.message || "Failed to update profile");
    return res.data;
  },
};
