// src/components/ui/ProjectCard.tsx
"use client";
import { Project } from "@/lib/data";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { getDriveImage } from "@/lib/driveUtils";

interface ProjectCardProps {
  project: Project;
  className?: string; 
}

export default function ProjectCard({ project, className }: ProjectCardProps) {
  
  const imageUrl = getDriveImage(project.image);
  const hasImage = Boolean(imageUrl);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "group relative h-full w-full overflow-hidden box-border",
        "border border-transparent hover:border-black transition-colors duration-300", 
        className
      )}
    >
      <Link href={`/projects/${project.id}`} className="block w-full h-full">
        
        {/* Image Container */}
        <div className="relative w-full h-full min-h-[300px] bg-gray-100 overflow-hidden">
          
          {hasImage ? (
            <Image
              src={imageUrl!}
              alt={project.title || "Project Image"}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-all duration-700 ease-out z-0 
              group-hover:scale-105 
              group-hover:blur-[3px] 
              group-hover:brightness-50" 
              // 👆 Blur + Darken on Hover
              onError={(e) => {
                e.currentTarget.style.display = 'none'; 
              }}
            />
          ) : (
            <div className="absolute inset-0 bg-neutral-200 z-0 flex items-center justify-center">
              <span className="text-neutral-400 text-[10px] uppercase tracking-widest font-mono">
                No Image
              </span>
            </div>
          )}
          
          {/* Text Overlay (No Background Color, Just Text) */}
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center p-4">
            <div className="relative z-20 flex flex-col items-center">
              
              {/* Title */}
              <h3 className="text-white text-2xl font-bold uppercase tracking-[0.2em] translate-y-8 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 ease-out">
                {project.title}
              </h3>
              
              {/* Category */}
              <span className="text-[#bfff00] text-xs uppercase tracking-widest mt-3 translate-y-8 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-100 ease-out font-medium">
                {project.category}
              </span>
              
              {/* Year */}
              <span className="text-white/70 text-[10px] font-mono mt-4 translate-y-4 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-150">
                {project.year}
              </span>
              
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}