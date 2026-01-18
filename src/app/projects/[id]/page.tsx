import { getSheetData } from "@/lib/googleSheets";
import { Project, ProjectSection } from "@/lib/data";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getDriveImage } from "@/lib/driveUtils";

// Components
import ProjectHero from "@/components/project/ProjectHero";
import ImageHub from "@/components/project/ImageHub";
import BeforeAfterSlider from "@/components/ui/BeforeAfterSlider"; // Adjusted path to your UI folder if needed

// Force dynamic rendering to fetch fresh data
export const dynamic = "force-dynamic";

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // 1. Fetch data
  const rawData = await getSheetData("Projects");
  const project = rawData.find((p: any) => p.id === id) as Project | undefined;

  if (!project) {
    return notFound();
  }

  // ---------------------------------------------------------
  // 🟢 MOCK DATA INJECTION (Remove this block when Sheet has columns)
  // This ensures you see the UI elements even without backend changes.
  // We reuse the main image or specific IDs if you have them.
  if (!project.sections) {
    project.sections = [
      {
        title: "Entrance Hall",
        images: [project.image, project.image] // Using main image twice as placeholder
      },
      {
        title: "Living Area",
        images: [project.image]
      },
      {
        title: "Exterior",
        images: [project.image, project.image, project.image]
      }
    ] as ProjectSection[];
  }
  
  if (!project.gallery) {
    // Mock gallery with existing images to show layout
    project.gallery = [project.image, project.image, project.image, project.image];
  }
  // ---------------------------------------------------------

  // Process Main Images
  const mainImage = getDriveImage(project.image);
  const beforeImg = getDriveImage(project.beforeImage);
  const afterImg = getDriveImage(project.afterImage);
  const hasSlider = Boolean(beforeImg && afterImg);

  return (
    <div className="min-h-screen bg-white pb-24">
      
      {/* 1. NEW INTERACTIVE HERO */}
      <ProjectHero 
        project={project} 
        mainImageSrc={mainImage} 
      />

      <div className="max-w-7xl mx-auto px-6 md:px-12 pt-12">
        <Link href="/" className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest text-gray-400 hover:text-black transition-colors mb-12">
            ← Back to Projects
        </Link>

        {/* 2. OVERVIEW & DETAILS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
            
            <div className="lg:col-span-8">
                <h2 className="text-xl font-light uppercase tracking-widest mb-8 border-b border-black/10 pb-4">Project Overview</h2>
                <div className="prose prose-neutral max-w-none text-gray-600 font-light leading-relaxed whitespace-pre-line text-sm md:text-base">
                    {project.description || "No description provided for this project."}
                </div>
            </div>

            <div className="lg:col-span-4 space-y-8">
                <div className="bg-gray-50 p-8 border border-gray-100">
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
                        <div>
                            <span className="block text-[10px] text-gray-400 uppercase tracking-widest mb-1">Status</span>
                            <span className="text-sm text-black">Completed</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* 3. IMAGE HUB (New Section) */}
        {project.gallery && (
          <ImageHub images={project.gallery} />
        )}

        {/* 4. BEFORE / AFTER SLIDER (Existing) */}
        {hasSlider && (
            <div className="mt-24">
                <h2 className="text-xl font-light uppercase tracking-widest mb-8 border-b border-black/10 pb-4 text-center">Transformation</h2>
                <BeforeAfterSlider 
                    beforeImage={beforeImg!} 
                    afterImage={afterImg!} 
                />
            </div>
        )}

      </div>
    </div>
  );
}