import { ApiClient } from "./client";

export interface RecyclerDashboardStats {
  available_marketplace_lots_count: number;
  active_orders_count: number;
  pending_reservations_count: number;
  total_purchased_kg: number;
  total_spend_inr: number;
  estimated_co2_offset_kg: number;
  waste_diverted_kg: number;
}

export interface SupplierItem {
  id: string;
  user_id: string;
  name: string;
  company_name?: string;
  service_area: string;
  is_verified: boolean;
  rating: number;
  total_pickups: number;
  phone?: string;
  materials_supplied: string[];
}

export interface RecyclerProfile {
  user_id: string;
  company_name?: string;
  contact_person?: string;
  phone?: string;
  address?: Record<string, any>;
  preferred_materials: string[];
  daily_procurement_capacity_tons: number;
}

export const recyclerApi = {
  getDashboard: async (): Promise<RecyclerDashboardStats> => {
    const res = await ApiClient.get<RecyclerDashboardStats>("/api/v1/recycler/dashboard");
    if (!res.success || !res.data) {
      return {
        available_marketplace_lots_count: 0,
        active_orders_count: 0,
        pending_reservations_count: 0,
        total_purchased_kg: 0,
        total_spend_inr: 0,
        estimated_co2_offset_kg: 0,
        waste_diverted_kg: 0,
      };
    }
    return res.data;
  },

  getSuppliers: async (): Promise<SupplierItem[]> => {
    const res = await ApiClient.get<{ items: SupplierItem[]; total: number }>("/api/v1/recycler/suppliers");
    if (!res.success || !res.data) return [];
    return res.data.items;
  },

  getProfile: async (): Promise<RecyclerProfile> => {
    const res = await ApiClient.get<RecyclerProfile>("/api/v1/recycler/profile");
    if (!res.success || !res.data) {
      return {
        user_id: "",
        company_name: "PolyRecycle Plant",
        preferred_materials: ["PET Plastic", "Cardboard"],
        daily_procurement_capacity_tons: 10.0,
      };
    }
    return res.data;
  },

  updateProfile: async (data: Partial<RecyclerProfile>): Promise<RecyclerProfile> => {
    const res = await ApiClient.patch<RecyclerProfile>("/api/v1/recycler/profile", data);
    if (!res.success || !res.data) throw new Error(res.message || "Failed to update profile");
    return res.data;
  },
};
