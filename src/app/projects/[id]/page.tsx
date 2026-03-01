import { createClient } from "@/lib/supabase/server";
import { Project } from "@/lib/data";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getDriveImage } from "@/lib/driveUtils";

// Components
import ProjectHero from "@/components/project/ProjectHero";
import ImageHub from "@/components/project/ImageHub";

// Force dynamic rendering to fetch fresh data
export const dynamic = "force-dynamic";

// Helper to serialize nested Supabase data back to the frontend Project structure
function formatProjectData(row: any): Project {
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
    id: row.id,
    title: row.title,
    year: row.year || "",
    category: row.category || "",
    image: row.image || "",
    gridSize: row.grid_size || 'normal',
    description: row.description || "",
    client: row.client || "",
    location: row.location || "",
    beforeImage: row.before_image || "",
    afterImage: row.after_image || "",
    heroImages,
    sections,
    spaces,
    gallery
  };
}

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Simple UUID v4 regex
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);

  const supabase = await createClient();
  let query = supabase
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
    `);

  // Only query the UUID column if the ID format is correct, otherwise Supabase throws an invalid cast error
  if (isUuid) {
    query = query.or(`id.eq.${id},legacy_id.eq.${id}`);
  } else {
    query = query.eq("legacy_id", id);
  }

  const { data: row, error } = await query.single();

  if (error || !row) {
    console.error("Project Page Error:", error, "ID:", id);
    return notFound();
  }

  const project = formatProjectData(row);

  // Fallback for Main Image
  const mainImage = getDriveImage(project.image);


  return (
    <div className="min-h-screen bg-white pb-24">

      {/* 1. HERO (Dynamic Sections) */}
      <ProjectHero
        project={project}
        mainImageSrc={mainImage}
      />

      <div className="max-w-7xl mx-auto px-6 md:px-12 pt-16">
        <Link href="/" className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest text-gray-400 hover:text-black transition-colors mb-16">
          ← Back to Projects
        </Link>

        {/* 2. OVERVIEW */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 mb-24">
          <div className="lg:col-span-8">
            <h2 className="text-sm font-bold uppercase tracking-widest mb-6 border-b border-black/10 pb-4">Project Overview</h2>
            <div className="prose prose-neutral max-w-none text-gray-600 font-light leading-relaxed whitespace-pre-line text-sm md:text-base">
              {project.description || "No description provided."}
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="bg-gray-50 p-8 border border-gray-100 sticky top-24">
              <h3 className="text-xs font-bold uppercase tracking-widest mb-6 text-black">Details</h3>
              <div className="space-y-6">
                <div>
                  <span className="block text-[10px] text-gray-400 uppercase tracking-widest mb-1">Client</span>
                  <span className="text-sm text-black">{project.client || "Private Client"}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-gray-400 uppercase tracking-widest mb-1">Location</span>
                  <span className="text-sm text-black">{project.location || "Unknown"}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-gray-400 uppercase tracking-widest mb-1">Year</span>
                  <span className="text-sm text-black">{project.year}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. DYNAMIC IMAGE HUB (Spaces + Gallery) */}
        <ImageHub
          spaces={project.spaces}
          finalGallery={project.gallery}
        />

      </div>
    </div>
  );
}