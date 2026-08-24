"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { Roles, Portals } from "@/types/globals";

export async function setUserRole(role: Roles, portal?: Portals) {
  const { userId } = auth();

  if (!userId) {
    return { success: false, message: "Not Authorized: No active Clerk session" };
  }

  // Enforce portal boundaries:
  // INDIVIDUAL allows: HOUSEHOLD, COLLECTOR
  // BUSINESS allows: RECYCLER, ENTERPRISE
  if (portal === "INDIVIDUAL" && !["HOUSEHOLD", "COLLECTOR"].includes(role)) {
    return { success: false, message: `Role ${role} is not valid for Individual portal` };
  }
  if (portal === "BUSINESS" && !["RECYCLER", "ENTERPRISE"].includes(role)) {
    return { success: false, message: `Role ${role} is not valid for Business portal` };
  }

  try {
    const client = typeof clerkClient === "function" ? clerkClient() : clerkClient;
    const res = await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        role: role,
        portal: portal || (["HOUSEHOLD", "COLLECTOR"].includes(role) ? "INDIVIDUAL" : "BUSINESS"),
      },
    });

    return {
      success: true,
      role: res.publicMetadata.role as Roles,
      portal: res.publicMetadata.portal as Portals,
    };
  } catch (err: any) {
    console.error("Error setting Clerk role:", err);
    return { success: false, message: err.message || "Failed to update Clerk metadata" };
  }
}
