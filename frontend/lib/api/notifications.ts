import { ApiClient } from "./client";

export interface NotificationItem {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  action_url?: string;
  created_at: string;
}

export interface NotificationList {
  items: NotificationItem[];
  unread_count: number;
}

export const notificationsApi = {
  getNotifications: async (limit = 50): Promise<NotificationList> => {
    const res = await ApiClient.get<NotificationList>(`/api/v1/notifications?limit=${limit}`);
    if (!res.success || !res.data) {
      return { items: [], unread_count: 0 };
    }
    return res.data;
  },

  markAsRead: async (id: string): Promise<boolean> => {
    const res = await ApiClient.patch<boolean>(`/api/v1/notifications/${id}/read`);
    return res.success;
  },

  markAllAsRead: async (): Promise<boolean> => {
    const res = await ApiClient.patch<boolean>("/api/v1/notifications/read-all");
    return res.success;
  },
};
