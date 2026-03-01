// src/app/components/ProjectGrid.tsx
"use client";
import { useState, useEffect } from "react";
import { Project } from "@/lib/data";
import ProjectCard from "./ProjectCard";
import { AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useUser } from "@/hooks/useUser";
import { createClient } from "@/lib/supabase/client";

const MAX_COL_SPAN = 12;
const MAX_ROW_SPAN = 6;

export default function ProjectGrid() {
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  const { user } = useUser();
  const isAdmin = user?.role === "admin";

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

    // Setup Realtime Sync
    const supabase = createClient();
    const channel = supabase
      .channel('grid-realtime')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'projects',
        },
        (payload) => {
          setAllProjects((prev) =>
            prev.map(p => p.id === payload.new.id
              ? {
                ...p,
                gridColSpan: payload.new.grid_col_span ?? p.gridColSpan,
                gridRowSpan: payload.new.grid_row_span ?? p.gridRowSpan,
              }
              : p
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filteredProjects =
    filter === "All"
      ? allProjects
      : allProjects.filter((project) => project.year === filter);

  const handleSpanChange = async (id: string, axis: "col" | "row", delta: number) => {
    setAllProjects((prev) =>
      prev.map(p => {
        if (p.id !== id) return p;
        if (axis === "col") {
          const next = Math.min(MAX_COL_SPAN, Math.max(1, (p.gridColSpan || 1) + delta));
          return { ...p, gridColSpan: next };
        } else {
          const next = Math.min(MAX_ROW_SPAN, Math.max(1, (p.gridRowSpan || 1) + delta));
          return { ...p, gridRowSpan: next };
        }
      })
    );

    const project = allProjects.find(p => p.id === id);
    if (!project) return;

    const body: Record<string, number> = {};
    if (axis === "col") body.gridColSpan = Math.min(MAX_COL_SPAN, Math.max(1, (project.gridColSpan || 1) + delta));
    else body.gridRowSpan = Math.min(MAX_ROW_SPAN, Math.max(1, (project.gridRowSpan || 1) + delta));

    try {
      await fetch(`/api/projects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
    } catch (error) {
      console.error("Failed to update span:", error);
    }
  };

  const years = ["All", ...Array.from(new Set(allProjects.map((p) => p.year))).sort().reverse()];

  return (
    <div className="w-full pb-24">
      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-12 gap-4 animate-pulse">
          <div className="h-[400px] col-span-8 row-span-2" style={{ background: 'rgb(var(--border))' }}></div>
          <div className="h-[200px] col-span-4" style={{ background: 'rgb(var(--border))' }}></div>
          <div className="h-[200px] col-span-4" style={{ background: 'rgb(var(--border))' }}></div>
          <div className="h-[400px] col-span-4 row-span-2" style={{ background: 'rgb(var(--border))' }}></div>
          <div className="h-[200px] col-span-4" style={{ background: 'rgb(var(--border))' }}></div>
        </div>
      )}

      {/* Content */}
      {!isLoading && (
        <>
          {/* Floating Filter Menu */}
          <div className="sticky top-24 z-40 mb-12 flex justify-center pointer-events-none">
            <div
              className="pointer-events-auto backdrop-blur-md px-6 py-3 rounded-full shadow-sm flex gap-6 overflow-x-auto max-w-[90vw] md:max-w-none no-scrollbar border"
              style={{ background: 'rgba(var(--bg), 0.8)', borderColor: 'rgb(var(--border))' }}
            >
              {years.map((year) => (
                <button
                  key={year}
                  onClick={() => setFilter(year)}
                  className="text-[10px] uppercase tracking-[0.2em] transition-all duration-300 whitespace-nowrap flex-shrink-0"
                  style={{
                    color: filter === year ? 'rgb(var(--fg))' : 'rgb(var(--fg-muted))',
                    fontWeight: filter === year ? '700' : '400',
                    transform: filter === year ? 'scale(1.05)' : 'scale(1)',
                  }}
                >
                  {year}
                </button>
              ))}
            </div>
          </div>

          {/* 12-Column Freeform Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 grid-flow-dense auto-rows-[minmax(250px,auto)]">
            <AnimatePresence mode="popLayout">
              {filteredProjects.map((project) => {
                const colSpan = project.gridColSpan || 4;
                const rowSpan = project.gridRowSpan || 1;
                return (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    style={{
                      gridColumn: `span ${colSpan} / span ${colSpan}`,
                      gridRow: `span ${rowSpan} / span ${rowSpan}`,
                    }}
                    isAdmin={isAdmin}
                    onSpanChange={handleSpanChange}
                  />
                );
              })}
            </AnimatePresence>

            {filteredProjects.length === 0 && (
              <div className="col-span-full py-24 text-center">
                <p className="text-xs uppercase tracking-widest" style={{ color: 'rgb(var(--fg-muted))' }}>No projects found.</p>
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