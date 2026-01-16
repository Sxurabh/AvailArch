// src/app/components/ProjectGrid.tsx
"use client";
import { useState, useEffect } from "react";
import { Project } from "@/lib/data"; 
import ProjectCard from "./ProjectCard";
import { AnimatePresence, motion } from "framer-motion";
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

  const getGridClass = (index: number) => {
    // 🆕 Mobile: Always col-span-1. md/lg: Use complex pattern
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
      {/* Loading State */}
      {isLoading && (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            <div className="h-[400px] bg-gray-200 md:col-span-2 md:row-span-2"></div>
            <div className="h-[200px] bg-gray-200"></div>
            <div className="h-[200px] bg-gray-200"></div>
            <div className="h-[400px] bg-gray-200 md:row-span-2"></div>
            <div className="h-[200px] bg-gray-200"></div>
         </div>
      )}

      {/* Content */}
      {!isLoading && (
        <>
          {/* Floating Filter Menu */}
          <div className="sticky top-24 z-40 mb-12 flex justify-center pointer-events-none">
            {/* 🆕 Added max-w-full and overflow handling for mobile swiping */}
            <div className="pointer-events-auto bg-white/80 backdrop-blur-md px-6 py-3 rounded-full border border-gray-100 shadow-sm flex gap-6 overflow-x-auto max-w-[90vw] md:max-w-none no-scrollbar">
              {years.map((year) => (
                <button
                  key={year}
                  onClick={() => setFilter(year)}
                  className={cn(
                    "text-[10px] uppercase tracking-[0.2em] transition-all duration-300 whitespace-nowrap flex-shrink-0", // 🆕 whitespace-nowrap prevents line breaks
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
            
            {filteredProjects.length === 0 && (
               <div className="col-span-full py-24 text-center">
                 <p className="text-xs uppercase tracking-widest text-gray-400">No projects found.</p>
               </div>
            )}
          </div>
          
          {filteredProjects.length > 0 && (
            <div className="mt-24 text-center">
              <span className="inline-block w-1 h-1 bg-black rounded-full mx-1"></span>
              <span className="inline-block w-1 h-1 bg-black rounded-full mx-1"></span>
              <span className="inline-block w-1 h-1 bg-black rounded-full mx-1"></span>
            </div>
          )}
        </>
      )}
      
      {/* 🆕 Hide Scrollbar Utility */}
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}