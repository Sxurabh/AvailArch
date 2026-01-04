"use client";
import { Project } from "@/lib/data";
import { motion } from "framer-motion";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ProjectCardProps {
  project: Project;
  className?: string; 
}

export default function ProjectCard({ project, className }: ProjectCardProps) {
  
  // 🛡️ HELPER: strictly validate if the string is a working URL
  const isValidUrl = (urlStr: string | undefined) => {
    if (!urlStr || typeof urlStr !== 'string') return false;
    const trimmed = urlStr.trim();
    if (trimmed.length === 0) return false;
    
    // Allow local images starting with "/"
    if (trimmed.startsWith("/")) return true;

    // Check if it's a valid absolute URL (http/https)
    try {
      new URL(trimmed);
      return true;
    } catch (e) {
      return false;
    }
  };

  const hasImage = isValidUrl(project.image);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "group cursor-pointer relative h-full w-full overflow-hidden box-border",
        "border border-transparent hover:border-black transition-colors duration-300", 
        className
      )}
    >
      {/* Image Container */}
      <div className="relative w-full h-full min-h-[300px] bg-gray-100">
        
        {/* CONDITIONAL RENDER: Only render Image if URL is strictly valid */}
        {hasImage ? (
          <Image
            src={project.image.trim()}
            alt={project.title || "Project Image"}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105 z-0"
            onError={(e) => {
              // Optional: Hide image if it fails to load even if URL syntax is valid
              const target = e.target as HTMLImageElement;
              target.style.display = "none";
            }}
          />
        ) : (
          // Fallback Placeholder (Safe Mode)
          <div className="absolute inset-0 bg-neutral-200 z-0 flex items-center justify-center">
            <span className="text-neutral-400 text-[10px] uppercase tracking-widest font-mono">
              No Image
            </span>
          </div>
        )}
        
        {/* OVERLAY */}
        <div className="absolute inset-0 z-10 bg-[#F59E0B] opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col items-center justify-center text-center p-4">
          <div className="relative z-20 flex flex-col items-center">
            <h3 className="text-black text-xl font-bold uppercase tracking-[0.2em] translate-y-4 group-hover:translate-y-0 transition-transform duration-500 ease-out">
              {project.title}
            </h3>
            <span className="text-black/80 text-xs uppercase tracking-widest mt-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-75 ease-out font-medium">
              {project.category}
            </span>
            <span className="text-black/70 text-[10px] font-mono mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-150">
              {project.year}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}