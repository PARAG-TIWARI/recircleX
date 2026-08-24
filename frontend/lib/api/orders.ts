import { ApiClient } from "./client";

export interface OrderItem {
  id: string;
  buyer_id: string;
  seller_id: string;
  marketplace_listing_id: string;
  material: string;
  category: string;
  quantity: number;
  unit: string;
  unit_price: number;
  total_amount: number;
  quality: string;
  status: "PENDING" | "CONFIRMED" | "PROCESSING" | "COMPLETED" | "CANCELLED";
  delivery_address?: Record<string, any>;
  notes?: string;
  timeline: Array<{
    title: string;
    description: string;
    timestamp: string;
    status: string;
  }>;
  created_at: string;
  updated_at: string;
  buyer_name?: string;
  seller_name?: string;
  seller_service_area?: string;
}

export interface OrderList {
  items: OrderItem[];
  total: number;
}

export const ordersApi = {
  getOrders: async (asSeller = false, statusFilter?: string): Promise<OrderList> => {
    let url = `/api/v1/orders?as_seller=${asSeller}`;
    if (statusFilter) url += `&status_filter=${statusFilter}`;
    const res = await ApiClient.get<OrderList>(url);
    if (!res.success || !res.data) return { items: [], total: 0 };
    return res.data;
  },

  getOrderDetail: async (id: string): Promise<OrderItem> => {
    const res = await ApiClient.get<OrderItem>(`/api/v1/orders/${id}`);
    if (!res.success || !res.data) throw new Error(res.message || "Failed to load order details");
    return res.data;
  },

  updateStatus: async (id: string, status: string, notes?: string): Promise<OrderItem> => {
    const res = await ApiClient.patch<OrderItem>(`/api/v1/orders/${id}/status`, { status, notes });
    if (!res.success || !res.data) throw new Error(res.message || "Failed to update order status");
    return res.data;
  },
};
