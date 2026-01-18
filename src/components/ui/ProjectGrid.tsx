// src/components/ui/ProjectGrid.tsx
"use client";
import { useState, useEffect } from "react";
import { Project } from "@/lib/data"; 
import ProjectCard from "./ProjectCard";
import { AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function ProjectGrid() {
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch("/api/projects", { cache: "no-store" });
        if (res.ok) {
          const data: Project[] = await res.json();
          setAllProjects(data.reverse()); 
        }
      } catch (error) {
        console.error("Failed to load projects", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProjects();
  }, []);
  
  const years = ["All", ...Array.from(new Set(allProjects.map((p) => p.year))).sort().reverse()];

  const filteredProjects =
    filter === "All"
      ? allProjects
      : allProjects.filter((project) => project.year === filter);

  // 🟢 UPDATED: Layout based on Project settings
  const getGridClass = (project: Project) => {
    // Defaults to Standard (1x1) if not set
    switch (project.gridSize) {
      case "wide": return "md:col-span-2 md:row-span-1"; // 2x1
      case "tall": return "md:col-span-1 md:row-span-2"; // 1x2
      case "big":  return "md:col-span-2 md:row-span-2"; // 2x2
      default:     return "md:col-span-1 md:row-span-1"; // 1x1
    }
  };

  return (
    <div className="w-full pb-24">
      {isLoading && (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            <div className="h-[300px] bg-gray-200 rounded-sm"></div>
            <div className="h-[300px] bg-gray-200 rounded-sm"></div>
            <div className="h-[300px] bg-gray-200 rounded-sm"></div>
         </div>
      )}

      {!isLoading && (
        <>
          {/* Responsive Filter Menu */}
          <div className="sticky top-[85px] z-30 mb-8 flex justify-center pointer-events-none">
            <div className="pointer-events-auto bg-white/90 backdrop-blur-md px-4 py-3 rounded-full border border-gray-100 shadow-sm flex gap-4 overflow-x-auto max-w-full no-scrollbar">
              {years.map((year) => (
                <button
                  key={year}
                  onClick={() => setFilter(year)}
                  className={cn(
                    "text-[10px] uppercase tracking-[0.2em] transition-all duration-300 whitespace-nowrap",
                    filter === year ? "text-black font-bold" : "text-gray-400 hover:text-black"
                  )}
                >
                  {year}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 grid-flow-dense">
            <AnimatePresence mode="popLayout">
              {filteredProjects.map((project) => (
                <ProjectCard 
                  key={project.id} 
                  project={project} 
                  className={getGridClass(project)}
                />
              ))}
            </AnimatePresence>
          </div>
        </>
      )}
    </div>
  );
}