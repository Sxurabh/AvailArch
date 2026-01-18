// src/app/api/projects/[id]/route.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { updateRow, deleteRow } from "@/lib/googleSheets";
import { NextResponse } from "next/server";

// Helper to check Admin
async function isAdmin() {
  // If you are testing locally without auth, you might temporarily return true here
  // return true; 
  const session = await getServerSession(authOptions);
  return (session?.user as any)?.role === "admin";
}

// 🟢 PUT: Update Project
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  try {
    console.log(`Updating project ${id}...`);
    // Ensure we are updating the row with the correct ID
    await updateRow("Projects", id, body);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Update Error:", error);
    return NextResponse.json({ error: error.message || "Failed to update project" }, { status: 500 });
  }
}

// 🟢 DELETE: Remove Project
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    console.log(`Deleting project ${id}...`);
    await deleteRow("Projects", id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete Error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete project" }, { status: 500 });
  }
}