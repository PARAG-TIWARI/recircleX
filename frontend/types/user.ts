export type UserRole = "HOUSEHOLD" | "COLLECTOR" | "RECYCLER" | "ENTERPRISE" | "ADMIN";

export type UserStatus = "ACTIVE" | "PENDING" | "SUSPENDED";

export interface User {
  id?: string;
  clerk_user_id: string;
  email?: string;
  role: UserRole;
  status: UserStatus;
  created_at?: string;
  updated_at?: string;
}

export interface Profile {
  id?: string;
  user_id: string;
  name?: string;
  phone?: string;
  avatar_url?: string;
  company_name?: string;
  location?: {
    city?: string;
    state?: string;
    postal_code?: string;
    address?: string;
    lat?: number;
    lng?: number;
  };
  created_at?: string;
  updated_at?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data: T | null;
  message: string;
  error?: {
    code?: number;
    detail?: any;
    request_id?: string;
  } | null;
}
