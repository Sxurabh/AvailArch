"use client";
import { useState } from "react";
import { projects } from "@/lib/data";
import ProjectCard from "./ProjectCard";
import { AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function ProjectGrid() {
  const [filter, setFilter] = useState("All");
  
  const years = ["All", ...Array.from(new Set(projects.map((p) => p.year))).sort().reverse()];

  const filteredProjects =
    filter === "All"
      ? projects
      : projects.filter((project) => project.year === filter);

  // 🎨 Layout Pattern Generator (Refined for Bento/Masonry feel)
  const getGridClass = (index: number) => {
    // A 12-item repeating pattern to create visual variety
    const patternIndex = index % 12; 
    
    switch (patternIndex) {
      // Row 1
      case 0: return "md:col-span-2 md:row-span-2"; // Large Hero (2x2)
      case 1: return "md:col-span-1 md:row-span-1"; // Standard
      case 2: return "md:col-span-1 md:row-span-1"; // Standard
      
      // Row 2
      case 3: return "md:col-span-1 md:row-span-2"; // Tall Portrait
      case 4: return "md:col-span-1 md:row-span-1"; // Standard
      case 5: return "md:col-span-1 md:row-span-1"; // Standard

      // Row 3
      case 6: return "md:col-span-2 md:row-span-1"; // Wide Landscape
      case 7: return "md:col-span-1 md:row-span-1"; // Standard

      // Row 4
      case 8: return "md:col-span-1 md:row-span-1"; // Standard
      case 9: return "md:col-span-1 md:row-span-2"; // Tall Portrait
      case 10: return "md:col-span-1 md:row-span-1"; // Standard
      case 11: return "md:col-span-1 md:row-span-1"; // Standard

      default: return "md:col-span-1 md:row-span-1";
    }
  };

  return (
    <div className="w-full pb-24">
      {/* Floating Filter Menu */}
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

      {/* The Random Grid 
          - 'grid-flow-dense' is CRITICAL: it fills the gaps by pulling smaller items into empty spots
          - 'auto-rows-[minmax(300px,_auto)]' ensures rows have a consistent base height
      */}
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
      
      {/* "End of List" Marker */}
      <div className="mt-24 text-center">
        <span className="inline-block w-1 h-1 bg-black rounded-full mx-1"></span>
        <span className="inline-block w-1 h-1 bg-black rounded-full mx-1"></span>
        <span className="inline-block w-1 h-1 bg-black rounded-full mx-1"></span>
      </div>
    </div>
  );
}