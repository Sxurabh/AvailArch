// src/app/components/ProjectGrid.tsx
"use client";
import { useState, useEffect } from "react";
import { Project } from "@/lib/data";
import ProjectCard from "./ProjectCard"; // Ensure this path is correct based on your folder structure
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

  // 🟢 UPDATED: Use the project's 'gridSize' property
  const getGridClass = (project: Project) => {
    // Defaults to "normal" (1x1) if field is missing/empty
    switch (project.gridSize) {
      case "wide": return "md:col-span-2 md:row-span-1"; // 2 Cols, 1 Row
      case "tall": return "md:col-span-1 md:row-span-2"; // 1 Col, 2 Rows
      case "big": return "md:col-span-2 md:row-span-2"; // 2 Cols, 2 Rows
      case "normal":
      default: return "md:col-span-1 md:row-span-1"; // Standard Square
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
            <div className="pointer-events-auto bg-white/80 backdrop-blur-md px-6 py-3 rounded-full border border-gray-100 shadow-sm flex gap-6 overflow-x-auto max-w-[90vw] md:max-w-none no-scrollbar">
              {years.map((year) => (
                <button
                  key={year}
                  onClick={() => setFilter(year)}
                  className={cn(
                    "text-[10px] uppercase tracking-[0.2em] transition-all duration-300 whitespace-nowrap flex-shrink-0",
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
              {filteredProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  // 🟢 Pass the PROJECT, not the index
                  className={getGridClass(project)}
                />
              ))}
            </AnimatePresence>

            {filteredProjects.length === 0 && (
              <div className="col-span-full py-24 text-center">
                <p className="text-xs uppercase tracking-widest text-gray-400">No projects found.</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Scrollbar Utility */}
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