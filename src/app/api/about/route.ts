// src/app/api/about/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // Adjust path if authOptions is elsewhere

export async function GET() {
  // In the future, read from a JSON file or DB here
  return NextResponse.json({ message: "Fetch implemented" });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  
  // 🔒 Security Check
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await req.json();

  // TODO: Save 'data' to a database, Google Sheet, or local JSON file.
  // For now, we just acknowledge receipt.
  console.log("Saving About Page Data:", data);

  return NextResponse.json({ success: true, data });
}