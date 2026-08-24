import { ApiClient } from "./client";

export interface PickupItem {
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
    contact_phone?: string;
  };
  preferred_time: string;
  status: "REQUEST_CREATED" | "COLLECTOR_ASSIGNED" | "ON_THE_WAY" | "COLLECTED" | "CANCELLED";
  notes?: string;
  actual_weight?: number;
  final_amount?: number;
  created_at: string;
  updated_at: string;
  listing_title?: string;
  material?: string;
  category?: string;
  images: string[];
}

export interface CreatePickupPayload {
  listing_id: string;
  address_id?: string;
  address_snapshot?: Record<string, any>;
  preferred_time: string;
  notes?: string;
}

export const pickupsApi = {
    getAvailableSlots: async (): Promise<Record<string, string[]>> => {
    const res = await ApiClient.get<Record<string, string[]>>("/api/v1/pickups/available-slots");
    if (!res.success || !res.data) return {};
    return res.data;
  },

  createPickup: async (data: CreatePickupPayload): Promise<PickupItem> => {
    const res = await ApiClient.post<PickupItem>("/api/v1/pickups", data);
    if (!res.success || !res.data) throw new Error(res.message || "Failed to create pickup");
    return res.data;
  },

  getMyPickups: async (limit = 50, skip = 0): Promise<{ items: PickupItem[]; total: number }> => {
    const res = await ApiClient.get<{ items: PickupItem[]; total: number }>(
      `/api/v1/pickups/my?limit=${limit}&skip=${skip}`
    );
    if (!res.success || !res.data) return { items: [], total: 0 };
    return res.data;
  },

  getPickup: async (id: string): Promise<PickupItem> => {
    const res = await ApiClient.get<PickupItem>(`/api/v1/pickups/${id}`);
    if (!res.success || !res.data) throw new Error(res.message || "Pickup not found");
    return res.data;
  },
};
