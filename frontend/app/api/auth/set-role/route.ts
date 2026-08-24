import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: No active Clerk session" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { role, portal } = body;

    if (!role) {
      return NextResponse.json(
        { success: false, message: "Role is required" },
        { status: 400 }
      );
    }

    // Update user metadata directly in Clerk
    const client = typeof clerkClient === "function" ? clerkClient() : clerkClient;
    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        role: role,
        portal: portal || (["HOUSEHOLD", "COLLECTOR"].includes(role) ? "INDIVIDUAL" : "BUSINESS"),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Clerk role metadata updated successfully",
      data: {
        userId,
        role,
        portal,
      },
    });
  } catch (error: any) {
    console.error("Error setting Clerk role metadata:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update Clerk metadata" },
      { status: 500 }
    );
  }
}
