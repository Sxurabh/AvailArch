// src/components/ui/ProjectCard.tsx
"use client";
import { Project } from "@/lib/data";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { getDriveImage } from "@/lib/driveUtils";
import React from "react";

interface ProjectCardProps {
  project: Project;
  className?: string;
  style?: React.CSSProperties;
  isAdmin?: boolean;
  onSpanChange?: (id: string, axis: "col" | "row", delta: number) => void;
}

export default function ProjectCard({ project, className, style, isAdmin, onSpanChange }: ProjectCardProps) {

  const imageUrl = getDriveImage(project.image);
  const hasImage = Boolean(imageUrl);
  const colSpan = project.gridColSpan || 4;
  const rowSpan = project.gridRowSpan || 1;

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
      style={style}
    >
      <Link href={`/projects/${project.id}`} className="block w-full h-full">

        {/* Image Container */}
        <div className="relative w-full h-full min-h-[250px] bg-gray-100 overflow-hidden">

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

          {/* Admin Freeform Resize Controls */}
          {isAdmin && onSpanChange && (
            <div
              className="absolute top-3 right-3 z-30 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
            >
              {/* Width Controls */}
              <div className="flex items-center gap-1 bg-black/60 backdrop-blur-sm rounded-md px-2 py-1">
                <span className="text-[9px] text-white/60 uppercase tracking-wider font-mono mr-1">W</span>
                <button
                  onClick={() => onSpanChange(project.id, "col", -1)}
                  disabled={colSpan <= 1}
                  className="w-5 h-5 text-[11px] font-bold rounded-sm flex items-center justify-center text-white hover:bg-[#8a9a5b] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  −
                </button>
                <span className="text-[10px] text-[#8a9a5b] font-mono w-4 text-center font-bold">{colSpan}</span>
                <button
                  onClick={() => onSpanChange(project.id, "col", 1)}
                  disabled={colSpan >= 12}
                  className="w-5 h-5 text-[11px] font-bold rounded-sm flex items-center justify-center text-white hover:bg-[#8a9a5b] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  +
                </button>
              </div>

              {/* Height Controls */}
              <div className="flex items-center gap-1 bg-black/60 backdrop-blur-sm rounded-md px-2 py-1">
                <span className="text-[9px] text-white/60 uppercase tracking-wider font-mono mr-1">H</span>
                <button
                  onClick={() => onSpanChange(project.id, "row", -1)}
                  disabled={rowSpan <= 1}
                  className="w-5 h-5 text-[11px] font-bold rounded-sm flex items-center justify-center text-white hover:bg-[#8a9a5b] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  −
                </button>
                <span className="text-[10px] text-[#8a9a5b] font-mono w-4 text-center font-bold">{rowSpan}</span>
                <button
                  onClick={() => onSpanChange(project.id, "row", 1)}
                  disabled={rowSpan >= 6}
                  className="w-5 h-5 text-[11px] font-bold rounded-sm flex items-center justify-center text-white hover:bg-[#8a9a5b] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  +
                </button>
              </div>
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
              <span className="text-[#8a9a5b] text-xs uppercase tracking-widest mt-3 translate-y-8 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-100 ease-out font-medium">
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