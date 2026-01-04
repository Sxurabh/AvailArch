// src/app/api/projects/[id]/route.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { updateRow, deleteRow } from "@/lib/googleSheets";
import { NextResponse } from "next/server";

// Helper to check Admin
async function isAdmin() {
  const session = await getServerSession(authOptions);
  return (session?.user as any)?.role === "admin";
}

// 🟢 PUT: Update Project
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  try {
    // We pass body directly. Ensure body keys match Sheet headers exactly.
    await updateRow("Projects", id, body);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update Error:", error);
    return NextResponse.json({ error: "Failed to update project" }, { status: 500 });
  }
}

// 🟢 DELETE: Remove Project
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    await deleteRow("Projects", id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete Error:", error);
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
  }
}