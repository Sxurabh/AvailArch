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
      className={cn(
        "group cursor-pointer relative h-full w-full overflow-hidden box-border",
        // 1px Border: Transparent by default, becomes Black on hover
        "border border-transparent hover:border-black transition-colors duration-300", 
        className
      )}
    >
      {/* Image Container */}
      <div className="relative w-full h-full min-h-[300px] bg-gray-100">
        <Image
          src={project.image}
          alt={project.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105 z-0"
        />
        
        {/* 🔴 SOLID COLOR OVERLAY 🔴
           1. 'bg-[#F59E0B]': Removed the '/95'. This is now 100% solid.
           2. REPLACE #F59E0B with your exact hex code.
           3. 'z-10': Ensures it sits on top of the image.
        */}
        <div className="absolute inset-0 z-10 bg-[#bfff00] opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col items-center justify-center text-center p-4">
          
          {/* Content Wrapper */}
          <div className="relative z-20 flex flex-col items-center">
            
            {/* Title */}
            <h3 className="text-black text-xl font-bold uppercase tracking-[0.2em] translate-y-4 group-hover:translate-y-0 transition-transform duration-500 ease-out">
              {project.title}
            </h3>

            {/* Category */}
            <span className="text-black/80 text-xs uppercase tracking-widest mt-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-75 ease-out font-medium">
              {project.category}
            </span>

            {/* Year */}
            <span className="text-black/70 text-[10px] font-mono mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-150">
              {project.year}
            </span>
            
          </div>

        </div>
      </div>
    </motion.div>
  );
}