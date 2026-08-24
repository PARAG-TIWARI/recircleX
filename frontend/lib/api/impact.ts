import { ApiClient } from "./client";

export interface CategoryImpactItem {
  category: string;
  weight_kg: number;
  percentage: number;
  co2_saved_kg: number;
}

export interface HouseholdImpactData {
  total_material_recycled_kg: number;
  total_pickups_completed: number;
  active_listings_count: number;
  estimated_earnings_inr: number;
  estimated_co2_offset_kg: number;
  trees_equivalent: number;
  landfill_diverted_kg: number;
  categories: CategoryImpactItem[];
}

export const impactApi = {
  getHouseholdImpact: async (): Promise<HouseholdImpactData> => {
    const res = await ApiClient.get<HouseholdImpactData>("/api/v1/impact");
    if (!res.success || !res.data) {
      return {
        total_material_recycled_kg: 0,
        total_pickups_completed: 0,
        active_listings_count: 0,
        estimated_earnings_inr: 0,
        estimated_co2_offset_kg: 0,
        trees_equivalent: 0,
        landfill_diverted_kg: 0,
        categories: [],
      };
    }
    return res.data;
  },
};
