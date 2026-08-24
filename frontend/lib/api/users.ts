import { ApiClient } from "./client";
import { User, ApiResponse } from "@/types/user";

export const usersApi = {
  getMe: (): Promise<ApiResponse<User>> => {
    return ApiClient.get<User>("/api/v1/users/me");
  },
};
