import { getSheetData } from "@/lib/googleSheets";
import { Project } from "@/lib/data";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getDriveImage } from "@/lib/driveUtils";

// Components
import ProjectHero from "@/components/project/ProjectHero";
import ImageHub from "@/components/project/ImageHub";

// Force dynamic rendering to fetch fresh data
export const dynamic = "force-dynamic";

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const rawData = await getSheetData("Projects");
  const project = rawData.find((p: any) => p.id === id) as Project | undefined;

  if (!project) {
    return notFound();
  }

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