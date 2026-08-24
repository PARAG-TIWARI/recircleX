import { ApiClient } from "./client";

export const storageApi = {
  uploadImage: async (file: File): Promise<{ url: string; public_id: string }> => {
    const formData = new FormData();
    formData.append("file", file);

    const token = await (ApiClient as any).tokenGetter?.();
    const headers: Record<string, string> = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch("http://localhost:8000/api/v1/storage/upload", {
      method: "POST",
      headers,
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Failed to upload image to storage");
    }

    const json = await res.json();
    return json.data;
  },
};
