import { ApiClient } from "./client";
import { User, Profile, ApiResponse } from "@/types/user";

export interface SyncPayload {
  clerk_user_id: string;
  email?: string;
  role: string;
  portal: "INDIVIDUAL" | "BUSINESS";
  name?: string;
  company_name?: string;
  phone?: string;
  avatar_url?: string;
}

export interface SyncResponseData {
  user: User;
  profile: Profile;
}

export const authApi = {
  syncUser: (payload: SyncPayload, token?: string): Promise<ApiResponse<SyncResponseData>> => {
    const headers: Record<string, string> = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    return ApiClient.post<SyncResponseData>("/api/v1/auth/sync", payload, { headers });
  },
};
