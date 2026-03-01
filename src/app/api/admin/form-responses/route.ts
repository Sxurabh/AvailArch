import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getFormResponses } from "@/lib/sheetsAdmin"; // Keeps google sheets for Google Forms reading only?

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();

    // Security Check: Only allow Admins
    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Still using sheetsAdmin for fetching Google Form Responses? Yes, that wasn't scoped for migration away
    const { headers, data } = await getFormResponses();

    return NextResponse.json({ headers, data });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Failed to load responses. Check server logs and Sheet ID." },
      { status: 500 }
    );
  }
}