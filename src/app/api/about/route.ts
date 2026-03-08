// src/app/api/about/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  // In the future, read from a JSON file or DB here
  return NextResponse.json({ message: "Fetch implemented" });
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();

  // 🔒 Security Check
  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await req.json();

  // TODO: Save 'data' to a database, Google Sheet, or local JSON file.
  // For now, we just acknowledge receipt.
  console.log("Saving About Page Data:", data);

  return NextResponse.json({ success: true, data });
}