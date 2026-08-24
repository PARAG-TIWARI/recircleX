"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect } from "react";
import { ApiClient } from "@/lib/api/client";

export function AuthSyncProvider({ children }: { children: React.ReactNode }) {
  const { getToken, isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    if (isLoaded) {
      ApiClient.setTokenGetter(async () => {
        if (!isSignedIn) return null;
        try {
          return await getToken();
        } catch (e) {
          return null;
        }
      });
    }
  }, [isLoaded, isSignedIn, getToken]);

  return <>{children}</>;
}
