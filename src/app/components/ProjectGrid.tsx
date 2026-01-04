"use client";
import { useState, useEffect } from "react";
import { projects as staticProjects, Project } from "@/lib/data"; // Renamed for clarity
import ProjectCard from "./ProjectCard";
import { AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function ProjectGrid() {
  // 1. Initialize with static data, but keep state ready for dynamic updates
  const [allProjects, setAllProjects] = useState<Project[]>(staticProjects);
  const [filter, setFilter] = useState("All");

  // 2. Fetch new projects from API on mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch("/api/projects", { cache: "no-store" });
        if (res.ok) {
          const newProjects: Project[] = await res.json();
          // Merge: Newest (Dynamic) projects first, then Static ones
          // OR: [...staticProjects, ...newProjects] if you want them at the end.
          // Using standard "Append to end" logic here:
          setAllProjects([...staticProjects, ...newProjects]);
        }
      } catch (error) {
        console.error("Failed to load dynamic projects", error);
      }
    };

    fetchProjects();
  }, []);
  
  // 3. Generate Filter List dynamically based on the merged data
  const years = ["All", ...Array.from(new Set(allProjects.map((p) => p.year))).sort().reverse()];

  const filteredProjects =
    filter === "All"
      ? allProjects
      : allProjects.filter((project) => project.year === filter);

  // 🎨 Layout Pattern Generator
  const getGridClass = (index: number) => {
    const patternIndex = index % 12; 
    switch (patternIndex) {
      case 0: return "md:col-span-2 md:row-span-2"; 
      case 1: return "md:col-span-1 md:row-span-1"; 
      case 2: return "md:col-span-1 md:row-span-1"; 
      case 3: return "md:col-span-1 md:row-span-2"; 
      case 4: return "md:col-span-1 md:row-span-1"; 
      case 5: return "md:col-span-1 md:row-span-1"; 
      case 6: return "md:col-span-2 md:row-span-1"; 
      case 7: return "md:col-span-1 md:row-span-1"; 
      case 8: return "md:col-span-1 md:row-span-1"; 
      case 9: return "md:col-span-1 md:row-span-2"; 
      case 10: return "md:col-span-1 md:row-span-1"; 
      case 11: return "md:col-span-1 md:row-span-1"; 
      default: return "md:col-span-1 md:row-span-1";
    }
  };

  return (
    <div className="w-full pb-24">
      {/* Filter Menu */}
      <div className="sticky top-24 z-40 mb-12 flex justify-center pointer-events-none">
        <div className="pointer-events-auto bg-white/80 backdrop-blur-md px-6 py-3 rounded-full border border-gray-100 shadow-sm flex gap-6">
          {years.map((year) => (
            <button
              key={year}
              onClick={() => setFilter(year)}
              className={cn(
                "text-[10px] uppercase tracking-[0.2em] transition-all duration-300",
                filter === year
                  ? "text-black font-bold scale-105"
                  : "text-gray-400 hover:text-black"
              )}
            >
              {year}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 grid-flow-dense auto-rows-[minmax(300px,auto)]">
        <AnimatePresence mode="popLayout">
          {filteredProjects.map((project, index) => (
            <ProjectCard 
              key={project.id} 
              project={project} 
              className={getGridClass(index)}
            />
          ))}
        </AnimatePresence>
      </div>
      
      {/* Footer Dots */}
      <div className="mt-24 text-center">
        <span className="inline-block w-1 h-1 bg-black rounded-full mx-1"></span>
        <span className="inline-block w-1 h-1 bg-black rounded-full mx-1"></span>
        <span className="inline-block w-1 h-1 bg-black rounded-full mx-1"></span>
      </div>
    </div>
  );
}