import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: Request) {
  const supabase = await createClient();

  // RLS inherently handles admin vs user row fetching if Supabase auth is used.
  // Since we are migrating from NextAuth, we might not have user_id associated correctly yet.
  // However, because we configured RLS on requests ("Users can read own requests", "Admins can read all")
  // a standard select will return ONLY the rows this user is allowed to see.
  const { data: requests, error } = await supabase
    .from("requests")
    .select("*")
    .order('created_at', { ascending: false });

  if (error) {
    // If not authenticated, RLS will return an empty array or throw an error depending on config
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Format to match old interface if needed
  const formatted = requests.map((r: any) => ({
    id: r.id,
    userEmail: r.type, // We don't have explicit emails stored in requests except maybe through profiles
    date: new Date(r.created_at).toLocaleDateString(),
    type: r.type,
    description: r.description,
    status: r.status,
    adminNotes: r.admin_notes
  }));

  return NextResponse.json(formatted);
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const body = await req.json();

  // Rely on RLS to deny insert if unauthenticated
  const { error } = await supabase
    .from("requests")
    .insert({
      type: body.type,
      description: body.description,
      status: "Pending",
      admin_notes: ""
    });

  if (error) {
    console.error("Insert request error:", error);
    return NextResponse.json({ error: "Failed to create request" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function PATCH(req: Request) {
  const supabase = await createClient();
  const { id, status, adminNotes } = await req.json();

  // Rely on RLS admin-only update policy
  const { error } = await supabase
    .from("requests")
    .update({
      status: status,
      admin_notes: adminNotes
    })
    .eq('id', id);

  if (error) {
    console.error("Update request error:", error);
    return NextResponse.json({ error: "Failed to update request" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
