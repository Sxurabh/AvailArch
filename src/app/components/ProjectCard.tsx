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
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      // 'h-full' ensures the card takes up the full height of the grid cell (crucial for row-span-2)
      className={cn("group cursor-pointer relative flex flex-col h-full w-full", className)}
    >
      {/* Image Container - 'flex-1' allows it to fill all available vertical space */}
      <div className="relative w-full flex-1 min-h-[300px] overflow-hidden bg-gray-100">
        <Image
          src={project.image}
          alt={project.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
        />
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
        
        {/* Arrow Icon */}
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
           <svg className="w-6 h-6 text-white drop-shadow-md" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
             <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
           </svg>
        </div>
      </div>

      {/* Info Section */}
      <div className="mt-3 flex justify-between items-start shrink-0">
        <div className="flex flex-col gap-1">
          <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-black group-hover:text-gray-600 transition-colors">
            {project.title}
          </h3>
          <span className="text-[10px] text-gray-400 uppercase tracking-widest">
            {project.category}
          </span>
        </div>
        <span className="text-[10px] text-gray-300 font-mono pt-0.5">
          {project.year}
        </span>
      </div>
    </motion.div>
  );
}