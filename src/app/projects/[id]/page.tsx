import { getSheetData } from "@/lib/googleSheets";
import { Project } from "@/lib/data";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import BeforeAfterSlider from "@/app/components/BeforeAfterSlider";

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

  // 🛡️ HELPER: Strict URL Validation (Prevents crashes)
  const isValidUrl = (urlStr: string | undefined) => {
    if (!urlStr || typeof urlStr !== 'string') return false;
    const trimmed = urlStr.trim();
    if (trimmed.length === 0) return false;
    
    // Allow local paths (e.g., /images/test.jpg)
    if (trimmed.startsWith("/")) return true;

    // Check strict absolute URL validity
    try {
      new URL(trimmed);
      return true;
    } catch (e) {
      return false;
    }
  };

  const hasMainImage = isValidUrl(project.image);
  const hasSlider = isValidUrl(project.beforeImage) && isValidUrl(project.afterImage);

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* 1. HERO SECTION */}
      <div className="relative w-full h-[60vh] md:h-[80vh] bg-gray-100">
         
         {/* Render Image ONLY if valid */}
         {hasMainImage ? (
           <Image 
             src={project.image.trim()} 
             alt={project.title} 
             fill 
             className="object-cover"
             priority
           />
         ) : (
           // Fallback if image is missing/broken
           <div className="w-full h-full flex items-center justify-center bg-neutral-800">
              <span className="text-white/30 text-sm uppercase tracking-widest font-mono">
                Image Not Available
              </span>
           </div>
         )}

         <div className="absolute inset-0 bg-black/20" />
         
         {/* Title Overlay */}
         <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 bg-gradient-to-t from-black/80 to-transparent">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-white text-4xl md:text-6xl font-light uppercase tracking-widest mb-2">
                    {project.title}
                </h1>
                <div className="flex gap-4 text-white/80 text-xs md:text-sm uppercase tracking-[0.2em]">
                    <span>{project.category}</span>
                    <span>•</span>
                    <span>{project.year}</span>
                </div>
            </div>
         </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 pt-16">
        {/* Back Link */}
        <Link href="/" className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest text-gray-400 hover:text-black transition-colors mb-12">
            ← Back to Projects
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
            
            {/* 2. MAIN DESCRIPTION */}
            <div className="lg:col-span-8">
                <h2 className="text-xl font-light uppercase tracking-widest mb-8 border-b border-black/10 pb-4">Project Overview</h2>
                <div className="prose prose-neutral max-w-none text-gray-600 font-light leading-relaxed whitespace-pre-line">
                    {project.description || "No description provided for this project."}
                </div>
            </div>

            {/* 3. METADATA SIDEBAR */}
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

        {/* 4. BEFORE / AFTER SLIDER */}
        {hasSlider && (
            <div className="mt-24">
                <h2 className="text-xl font-light uppercase tracking-widest mb-8 border-b border-black/10 pb-4 text-center">Transformation</h2>
                <BeforeAfterSlider 
                    beforeImage={project.beforeImage!.trim()} 
                    afterImage={project.afterImage!.trim()} 
                />
            </div>
        )}

      </div>
    </div>
  );
}