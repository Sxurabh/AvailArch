"use client";
import { Project } from "../lib/data";
import { motion } from "framer-motion";
import Image from "next/image";

export default function ProjectCard({ project }: { project: Project }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="group cursor-pointer"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100 mb-4">
        <Image
          src={project.image}
          alt={project.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="text-md font-medium leading-tight group-hover:underline decoration-1 underline-offset-4">
          {project.title}
        </h3>
        <span className="text-xs text-muted">{project.category} — {project.year}</span>
      </div>
    </motion.div>
  );
}