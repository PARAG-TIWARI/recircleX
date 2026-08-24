import { ApiResponse } from "@/types/user";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export class ApiClient {
  private static tokenGetter: (() => Promise<string | null>) | null = null;

  public static setTokenGetter(getter: () => Promise<string | null>) {
    ApiClient.tokenGetter = getter;
  }

  public static async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint}`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (ApiClient.tokenGetter) {
      try {
        const token = await ApiClient.tokenGetter();
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }
      } catch (err) {
        console.warn("Could not retrieve auth token:", err);
      }
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data: ApiResponse<T> = await response.json().catch(() => ({
        success: response.ok,
        data: null,
        message: response.statusText,
        error: { code: response.status, detail: "Failed to parse JSON" },
      }));

      if (!response.ok && data.success) {
        data.success = false;
      }

      return data;
    } catch (error: any) {
      console.error(`API Error [${endpoint}]:`, error);
      return {
        success: false,
        data: null,
        message: error.message || "Network request failed",
        error: {
          code: 0,
          detail: error.message || "Network error",
        },
      };
    }
  }

  public static get<T = any>(endpoint: string, options?: RequestInit) {
    return ApiClient.request<T>(endpoint, { ...options, method: "GET" });
  }

  public static post<T = any>(endpoint: string, body?: any, options?: RequestInit) {
    return ApiClient.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public static put<T = any>(endpoint: string, body?: any, options?: RequestInit) {
    return ApiClient.request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public static patch<T = any>(endpoint: string, body?: any, options?: RequestInit) {
    return ApiClient.request<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public static delete<T = any>(endpoint: string, options?: RequestInit) {
    return ApiClient.request<T>(endpoint, { ...options, method: "DELETE" });
  }
}
