import { ApiClient } from "./client";

export interface MaterialAnalysisResult {
  material: string;
  category: string;
  confidence: number;
  quality: string;
  recyclable: boolean;
  estimated_price_per_kg: number;
  tips?: string;
}

export interface GeneratedListingResult {
  title: string;
  description: string;
  category: string;
  material: string;
  quality: string;
  estimated_price_min: number;
  estimated_price_max: number;
  estimated_price_display: string;
}

export interface EcoBotResult {
  answer: string;
  suggestions: string[];
}

export const aiApi = {
  analyzeMaterial: async (imageUrl: string): Promise<MaterialAnalysisResult> => {
    const res = await ApiClient.post<MaterialAnalysisResult>("/api/v1/ai/analyze-material", {
      image_url: imageUrl,
    });
    if (!res.success || !res.data) throw new Error(res.message || "Failed to analyze material");
    return res.data;
  },

  generateListing: async (data: {
    material: string;
    category: string;
    quality: string;
    quantity: number;
    unit?: string;
  }): Promise<GeneratedListingResult> => {
    const res = await ApiClient.post<GeneratedListingResult>("/api/v1/ai/generate-listing", data);
    if (!res.success || !res.data) throw new Error(res.message || "Failed to generate listing");
    return res.data;
  },

  queryEcoBot: async (
    query: string,
    history: Array<{ role: string; content: string }> = []
  ): Promise<EcoBotResult> => {
    const res = await ApiClient.post<EcoBotResult>("/api/v1/ai/ecobot", { query, history });
    if (!res.success || !res.data) throw new Error(res.message || "Failed to query EcoBot");
    return res.data;
  },
};
