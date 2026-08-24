"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function setRole(formData: FormData): Promise<void> {
  const { sessionClaims } = await auth();

  // Check that the user trying to set the Role is an admin
  const userRole = sessionClaims?.metadata?.role;
  if (userRole !== "admin" && userRole !== "ADMIN") {
    return;
  }

  const client = typeof clerkClient === "function" ? clerkClient() : clerkClient;

  try {
    const role = formData.get("role") as string;
    const portal =
      (formData.get("portal") as string) ||
      (["HOUSEHOLD", "COLLECTOR"].includes(role) ? "INDIVIDUAL" : "BUSINESS");

    await client.users.updateUserMetadata(formData.get("id") as string, {
      publicMetadata: {
        role: role,
        portal: portal,
      },
    });

    revalidatePath("/admin");
  } catch (err: any) {
    console.error("Error updating Clerk metadata:", err);
  }
}

export async function removeRole(formData: FormData): Promise<void> {
  const { sessionClaims } = await auth();

  const userRole = sessionClaims?.metadata?.role;
  if (userRole !== "admin" && userRole !== "ADMIN") {
    return;
  }

  const client = typeof clerkClient === "function" ? clerkClient() : clerkClient;

  try {
    await client.users.updateUserMetadata(formData.get("id") as string, {
      publicMetadata: { role: null, portal: null },
    });

    revalidatePath("/admin");
  } catch (err: any) {
    console.error("Error removing Clerk role:", err);
  }
}
