"use client";
import { useState } from "react";
import { projects } from "@/lib/data";
import ProjectCard from "./ProjectCard";
import { AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function ProjectGrid() {
  const [filter, setFilter] = useState("All");
  
  // Get unique years
  const years = ["All", ...Array.from(new Set(projects.map((p) => p.year))).sort().reverse()];

  const filteredProjects =
    filter === "All"
      ? projects
      : projects.filter((project) => project.year === filter);

  return (
    <div className="w-full">
      {/* Sticky Filter Header */}
      <div className="sticky top-20 z-40 bg-white/90 backdrop-blur-md py-6 mb-8 md:mb-16 -mx-6 px-6 md:mx-0 md:px-0 transition-all">
        <div className="flex flex-wrap gap-x-8 gap-y-3 text-[10px] tracking-[0.2em] uppercase font-semibold">
          {years.map((year) => (
            <button
              key={year}
              onClick={() => setFilter(year)}
              className={cn(
                "transition-all duration-300 ease-out",
                filter === year
                  ? "text-black"
                  : "text-neutral-300 hover:text-black"
              )}
            >
              {year}
            </button>
          ))}
        </div>
      </div>

      {/* Project Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-16 pb-24">
        <AnimatePresence mode="popLayout">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}