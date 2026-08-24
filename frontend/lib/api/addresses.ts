import { ApiClient } from "./client";

export interface AddressItem {
  id: string;
  user_id: string;
  label: string;
  street_address: string;
  city: string;
  state: string;
  postal_code: string;
  landmark?: string;
  contact_phone?: string;
  is_default: boolean;
  latitude?: number;
  longitude?: number;
  created_at: string;
  updated_at: string;
}

export interface CreateAddressPayload {
  label: string;
  street_address: string;
  city?: string;
  state?: string;
  postal_code: string;
  landmark?: string;
  contact_phone?: string;
  is_default?: boolean;
  latitude?: number;
  longitude?: number;
}

export const addressesApi = {
    reverseGeocode: async (lat: number, lon: number): Promise<{
    street_address: string;
    city: string;
    state: string;
    postal_code: string;
    latitude: number;
    longitude: number;
  }> => {
    const res = await ApiClient.get<{
      street_address: string;
      city: string;
      state: string;
      postal_code: string;
      latitude: number;
      longitude: number;
    }>(`/api/v1/addresses/reverse-geocode?lat=${lat}&lon=${lon}`);
    if (!res.success || !res.data) throw new Error(res.message || "Failed to reverse geocode");
    return res.data;
  },

  getAddresses: async (): Promise<AddressItem[]> => {
    const res = await ApiClient.get<AddressItem[]>("/api/v1/addresses");
    if (!res.success || !res.data) return [];
    return res.data;
  },

  createAddress: async (data: CreateAddressPayload): Promise<AddressItem> => {
    const res = await ApiClient.post<AddressItem>("/api/v1/addresses", data);
    if (!res.success || !res.data) throw new Error(res.message || "Failed to create address");
    return res.data;
  },

  updateAddress: async (id: string, data: Partial<CreateAddressPayload>): Promise<AddressItem> => {
    const res = await ApiClient.patch<AddressItem>(`/api/v1/addresses/${id}`, data);
    if (!res.success || !res.data) throw new Error(res.message || "Failed to update address");
    return res.data;
  },
};
