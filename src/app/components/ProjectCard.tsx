"use client";
import { Project } from "../lib/data";
import { motion } from "framer-motion";
import Image from "next/image";

export default function ProjectCard({ project }: { project: Project }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }} // Bezier for "luxurious" feel
      className="group cursor-pointer w-full"
    >
      {/* Image Container */}
      <div className="relative w-full aspect-[4/3] overflow-hidden bg-gray-100 mb-4">
        <Image
          src={project.image}
          alt={project.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
        />
        {/* Subtle overlay that fades on hover */}
        <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-500" />
      </div>

      {/* Info */}
      <div className="flex flex-col gap-1.5 px-1">
        <h3 className="text-xs font-semibold uppercase tracking-[0.1em] text-neutral-900 leading-relaxed group-hover:text-gray-600 transition-colors">
          {project.title}
        </h3>
        
        <div className="flex items-center gap-2 text-[9px] tracking-[0.15em] text-neutral-400 uppercase font-medium">
          <span>{project.year}</span>
          <span className="w-0.5 h-0.5 rounded-full bg-neutral-300"></span>
          <span>{project.category}</span>
        </div>
      </div>
    </motion.div>
  );
}