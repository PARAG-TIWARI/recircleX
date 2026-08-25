import { ApiResponse } from "@/types/user";

export function getApiBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (typeof window !== "undefined") {
    const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    if (!isLocalhost && (!envUrl || envUrl.includes("localhost") || envUrl.includes("127.0.0.1"))) {
      return "https://recirclex.onrender.com";
    }
  }
  return envUrl || "https://recirclex.onrender.com";
}

export class ApiClient {
  private static tokenGetter: (() => Promise<string | null>) | null = null;

  public static setTokenGetter(getter: () => Promise<string | null>) {
    ApiClient.tokenGetter = getter;
  }

  public static async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const baseUrl = getApiBaseUrl().replace(/\/+$/, "");
    const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const url = endpoint.startsWith("http") ? endpoint : `${baseUrl}${cleanEndpoint}`;

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

    if (!headers["Authorization"] && typeof window !== "undefined" && (window as any).Clerk?.session) {
      try {
        const token = await (window as any).Clerk.session.getToken();
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }
      } catch (err) {
        console.warn("Could not retrieve fallback auth token from Clerk session:", err);
      }
    }

    let attempts = 0;
    const maxAttempts = 2;

    while (attempts < maxAttempts) {
      attempts++;
      try {
        const response = await fetch(url, {
          ...options,
          headers,
        });

        const rawJson: any = await response.json().catch(() => null);

        let data: ApiResponse<T>;
        if (rawJson && typeof rawJson === "object") {
          data = {
            success: response.ok && (rawJson.success !== false),
            data: rawJson.data !== undefined ? rawJson.data : (response.ok ? rawJson : null),
            message: rawJson.message || rawJson.detail || (response.ok ? "Success" : response.statusText || "Request failed"),
            error: rawJson.error || (response.ok ? null : { code: response.status, detail: rawJson.detail || response.statusText }),
          };
        } else {
          data = {
            success: response.ok,
            data: null,
            message: response.ok ? "Success" : response.statusText || "Request failed",
            error: response.ok ? null : { code: response.status, detail: "Failed to parse response" },
          };
        }

        if (!response.ok) {
          data.success = false;
          if (response.status === 503) {
            data.message = data.message || "Database service currently unavailable. Please verify backend MongoDB configuration.";
          } else if (response.status === 500) {
            data.message = data.message || "Internal server error on RecycleX backend.";
          } else if (response.status === 401) {
            data.message = data.message || "Authentication credentials invalid or expired.";
          }
        }

        return data;
      } catch (error: any) {
        if (attempts < maxAttempts) {
          console.warn(`API Attempt ${attempts} failed [${endpoint}]:`, error.message, "- Retrying in 1s...");
          await new Promise((res) => setTimeout(res, 1000));
          continue;
        }

        console.error(`API Error [${endpoint}] after ${attempts} attempts:`, error);
        const isNetworkOrCors = error.name === "TypeError" || error.message?.includes("fetch");
        const formattedMsg = isNetworkOrCors
          ? "Unable to connect to RecycleX backend server. If the service is cold-starting, please retry in a moment."
          : error.message || "Network request failed";

        return {
          success: false,
          data: null,
          message: formattedMsg,
          error: {
            code: 0,
            detail: error.message || "Network error",
          },
        };
      }
    }

    return {
      success: false,
      data: null,
      message: "Network request failed",
      error: { code: 0, detail: "Max retries exceeded" },
    };
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
