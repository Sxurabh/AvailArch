import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: Request) {
  const supabase = await createClient();

  const { data: requests, error } = await supabase
    .from("requests")
    .select("*, profiles (email)")
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formatted = requests.map((r: any) => ({
    id: r.id,
    userEmail: r.profiles?.email || 'Unknown Client',
    date: new Date(r.created_at).toLocaleDateString(),
    // Legacy field
    type: r.type,
    description: r.description,
    status: r.status,
    adminNotes: r.admin_notes,
    // New fields
    projectCategory: r.project_category || "residential",
    commercialType: r.commercial_type,
    contactNo: r.contact_no,
    projectLocation: r.project_location,
    bhk: r.bhk,
    areaValue: r.area_value,
    areaUnit: r.area_unit || "sqft",
    planImages: r.plan_images || [],
    isArchived: r.is_archived || false,
  }));

  return NextResponse.json(formatted);
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const body = await req.json();

  // Get authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { error } = await supabase
    .from("requests")
    .insert({
      user_id: user.id,
      type: body.projectCategory === "commercial"
        ? `Commercial - ${body.commercialType || "General"}`
        : `Residential - ${body.bhk || ""}BHK`,
      description: body.description || "",
      status: "Pending",
      admin_notes: "",
      // New fields
      project_category: body.projectCategory || "residential",
      commercial_type: body.commercialType || null,
      contact_no: body.contactNo || null,
      project_location: body.projectLocation || null,
      bhk: body.bhk || null,
      area_value: body.areaValue ? Number(body.areaValue) : null,
      area_unit: body.areaUnit || "sqft",
      plan_images: body.planImages || [],
    });

  if (error) {
    console.error("Insert request error:", error);
    return NextResponse.json({ error: "Failed to create request" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function PATCH(req: Request) {
  const supabase = await createClient();
  const body = await req.json();
  const { id, status, adminNotes, isArchived } = body;

  const updateData: any = {};
  if (status !== undefined) updateData.status = status;
  if (adminNotes !== undefined) updateData.admin_notes = adminNotes;
  if (isArchived !== undefined) updateData.is_archived = isArchived;

  const { error } = await supabase
    .from("requests")
    .update(updateData)
    .eq('id', id);

  if (error) {
    console.error("Update request error:", error);
    return NextResponse.json({ error: "Failed to update request" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
