"use client";
import { useState } from "react";
import { projects } from "../lib/data";
import ProjectCard from "./ProjectCard";
import { AnimatePresence } from "framer-motion";

export default function ProjectGrid() {
  const [filter, setFilter] = useState("All");
  
  // Extract unique years for the filter menu
  const years = ["All", ...Array.from(new Set(projects.map((p) => p.year))).sort().reverse()];

  const filteredProjects =
    filter === "All"
      ? projects
      : projects.filter((project) => project.year === filter);

  return (
    <div className="w-full">
      {/* Filter Bar */}
      <div className="flex gap-6 mb-12 text-sm">
        {years.map((year) => (
          <button
            key={year}
            onClick={() => setFilter(year)}
            className={`transition-colors ${
              filter === year
                ? "text-black font-medium underline underline-offset-4"
                : "text-muted hover:text-black"
            }`}
          >
            {year}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
        <AnimatePresence mode="popLayout">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}