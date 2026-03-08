// src/app/api/projects/[id]/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// 🟢 PUT: Update Project
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();

  try {
    const supabase = await createClient();
    console.log(`Updating project ${id}...`);

    // 1. Update main project table
    const { error: projectError } = await supabase
      .from('projects')
      .update({
        title: body.title,
        year: body.year,
        category: body.category,
        image: body.image,
        grid_col_span: body.gridColSpan || 1,
        grid_row_span: body.gridRowSpan || 1,
        description: body.description,
        status: body.status || "active",
        scheduled_for: body.scheduledFor || null,
        client: body.client,
        location: body.location,
        before_image: body.beforeImage,
        after_image: body.afterImage
      })
      .eq('id', id);

    if (projectError) throw projectError;

    // To properly update relations, we delete existing and re-insert 
    // (A more scalable approach is to merge, but since frontend sends entire array, delete/insert is highly reliable)
    await supabase.from('project_hero_images').delete().eq('project_id', id);
    await supabase.from('project_spaces').delete().eq('project_id', id);
    await supabase.from('project_gallery').delete().eq('project_id', id);
    await supabase.from('project_sections').delete().eq('project_id', id);

    // 2. Insert Hero Images
    if (body.heroImages?.length) {
      await supabase.from('project_hero_images').insert(
        body.heroImages.map((img: string, i: number) => ({ project_id: id, image_url: img, sort_order: i }))
      );
    }

    // 3. Insert Spaces
    if (body.spaces?.length) {
      await supabase.from('project_spaces').insert(
        body.spaces.map((s: any, i: number) => ({
          project_id: id,
          name: s.name,
          main_image: s.mainImage,
          slider2d: s.slider2d,
          slider3d: s.slider3d,
          sort_order: i
        }))
      );
    }

    // 4. Insert Gallery
    if (body.gallery?.length) {
      await supabase.from('project_gallery').insert(
        body.gallery.map((g: any, i: number) => ({
          project_id: id,
          image_url: typeof g === 'string' ? g : g.id,
          size: typeof g === 'object' && g.size ? g.size : 'normal',
          sort_order: i
        }))
      );
    }

    // 5. Insert Sections
    if (body.sections?.length) {
      for (let i = 0; i < body.sections.length; i++) {
        const sec = body.sections[i];
        const { data: sectionRecord, error: secErr } = await supabase
          .from('project_sections')
          .insert({ project_id: id, title: sec.title, sort_order: i })
          .select('id')
          .single();

        if (!secErr && sec.images?.length) {
          await supabase.from('project_section_images').insert(
            sec.images.map((img: string, j: number) => ({
              section_id: sectionRecord.id,
              image_url: img,
              sort_order: j
            }))
          );
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Update Error:", error);
    return NextResponse.json({ error: error.message || "Failed to update project" }, { status: 500 });
  }
}

// 🟢 PATCH: Partial Update (freeform grid spans)
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();

  try {
    const supabase = await createClient();
    console.log(`Partial update for project ${id}...`, body);

    const updatePayload: Record<string, any> = {};
    if (body.gridColSpan !== undefined) updatePayload.grid_col_span = body.gridColSpan;
    if (body.gridRowSpan !== undefined) updatePayload.grid_row_span = body.gridRowSpan;

    // Try UUID match first, then fallback to legacy_id
    let result = await supabase.from('projects').update(updatePayload).eq('id', id);

    if (result.error || result.count === 0) {
      result = await supabase.from('projects').update(updatePayload).eq('legacy_id', id);
    }

    if (result.error) throw result.error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Patch Error:", error);
    return NextResponse.json({ error: error.message || "Failed to patch project" }, { status: 500 });
  }
}

// 🟢 DELETE: Remove Project
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const supabase = await createClient();
    console.log(`Deleting project ${id}...`);

    // RLS and ON DELETE CASCADE will handle permissions and related records
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete Error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete project" }, { status: 500 });
  }
}