import { ApiClient } from "./client";
import { Profile } from "@/types/user";

export interface ProfileData extends Profile {
  phone?: string;
  bio?: string;
}

export const profilesApi = {
  getMyProfile: async (): Promise<ProfileData> => {
    const res = await ApiClient.get<ProfileData>("/api/v1/profiles/me");
    if (!res.success || !res.data) throw new Error(res.message || "Failed to fetch profile");
    return res.data;
  },
  updateMyProfile: async (data: Partial<ProfileData>): Promise<ProfileData> => {
    const res = await ApiClient.patch<ProfileData>("/api/v1/profiles/me", data);
    if (!res.success || !res.data) throw new Error(res.message || "Failed to update profile");
    return res.data;
  },
};
