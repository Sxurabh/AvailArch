import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ProjectSpace, ProjectSection, ProjectGalleryItem } from "@/lib/data";

// Helper to serialize nested Supabase data back to the frontend Project structure
function formatProjectData(row: any) {
  // Try to use true UUID as ID, fallback to legacy for frontend compatibility
  const id = row.legacy_id || row.id;

  // Format spaces
  const spaces = row.project_spaces?.map((s: any) => ({
    name: s.name,
    mainImage: s.main_image,
    slider2d: s.slider2d,
    slider3d: s.slider3d,
  })) || [];

  // Format hero images
  const heroImages = row.project_hero_images
    ?.sort((a: any, b: any) => a.sort_order - b.sort_order)
    .map((h: any) => h.image_url) || [];

  // Format sections
  const sections = row.project_sections?.map((sec: any) => ({
    title: sec.title,
    images: sec.project_section_images?.sort((a: any, b: any) => a.sort_order - b.sort_order).map((img: any) => img.image_url) || []
  })) || [];

  // Format gallery
  const gallery = row.project_gallery
    ?.sort((a: any, b: any) => a.sort_order - b.sort_order)
    .map((g: any) => (g.size === 'normal' ? g.image_url : { id: g.image_url, size: g.size })) || [];

  return {
    id,
    title: row.title,
    year: row.year,
    category: row.category,
    image: row.image,
    gridColSpan: row.grid_col_span || 1,
    gridRowSpan: row.grid_row_span || 1,
    description: row.description,
    status: row.status || "active",
    scheduledFor: row.scheduled_for,
    client: row.client,
    location: row.location,
    beforeImage: row.before_image,
    afterImage: row.after_image,
    heroImages,
    sections,
    spaces,
    gallery
  };
}

// 🟢 GET: Fetch All Projects
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: projects, error } = await supabase
      .from("projects")
      .select(`
        *,
        project_spaces(*),
        project_hero_images(*),
        project_sections(
          *,
          project_section_images(*)
        ),
        project_gallery(*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const formattedProjects = projects.map(formatProjectData);
    return NextResponse.json(formattedProjects);
  } catch (error) {
    console.error("GET Projects Error:", error);
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
  }
}

// 🟢 POST: Create New Project
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    // 1. Insert Project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert({
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
      .select('id')
      .single();

    if (projectError) throw projectError;
    const newId = project.id;

    // 2. Insert Hero Images
    if (body.heroImages?.length) {
      await supabase.from('project_hero_images').insert(
        body.heroImages.map((img: string, i: number) => ({ project_id: newId, image_url: img, sort_order: i }))
      );
    }

    // 3. Insert Spaces
    if (body.spaces?.length) {
      await supabase.from('project_spaces').insert(
        body.spaces.map((s: any, i: number) => ({
          project_id: newId,
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
          project_id: newId,
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
          .insert({ project_id: newId, title: sec.title, sort_order: i })
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

    return NextResponse.json({ success: true, mode: "create", id: newId });

  } catch (error) {
    console.error("POST Project Error:", error);
    return NextResponse.json({ error: "Failed to save project" }, { status: 500 });
  }
}
