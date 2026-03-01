// src/components/admin/ProjectManager.tsx
"use client";

import { useState, useEffect } from "react";
import ProjectForm from "./ProjectForm";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Project } from "@/lib/data";
import Toast, { ToastType } from "@/components/ui/Toast";
import { getDriveImage } from "@/lib/driveUtils"; // 🟢 Import Image Helper

export default function ProjectManager() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeTab, setActiveTab] = useState<"index" | "create">("index");
  const [editingProject, setEditingProject] = useState<Project | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Toast State
  const [toast, setToast] = useState<{ msg: string; type: ToastType; visible: boolean }>({
    msg: "",
    type: "success",
    visible: false,
  });

  const showToast = (msg: string, type: ToastType = "success") => {
    setToast({ msg, type, visible: true });
    setTimeout(() => setToast((prev) => ({ ...prev, visible: false })), 3000);
  };

  useEffect(() => {
    if (activeTab === "index") {
      fetchProjects();
    }
  }, [activeTab]);

  async function fetchProjects() {
    setIsLoading(true);
    try {
      const res = await fetch("/api/projects", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setProjects(Array.isArray(data) ? data.reverse() : []);
    } catch (error) {
      console.error("Failed to fetch projects", error);
      showToast("Failed to sync projects", "error");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSaveProject(formData: Project) {
    setIsSaving(true);
    try {
      let res;
      if (editingProject && editingProject.id) {
        res = await fetch(`/api/projects/${editingProject.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      } else {
        res = await fetch("/api/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      }

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to save project");
      }

      showToast("Project saved successfully", "success");
      setEditingProject(undefined);
      setActiveTab("index");
      fetchProjects();

    } catch (error: any) {
      console.error("Save Error:", error);
      showToast(error.message, "error");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Irreversible action. Delete this project?")) return;

    if (!id) {
      showToast("Invalid Project ID", "error");
      return;
    }

    try {
      const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");

      setProjects((prev) => prev.filter((p) => p.id !== id));
      showToast("Project deleted", "info");
    } catch (error: any) {
      showToast(error.message, "error");
    }
  }

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setActiveTab("create");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="w-full pt-6 md:pt-10 px-0 md:px-6 min-h-[60vh] font-sans">
      <Toast
        message={toast.msg}
        type={toast.type}
        isVisible={toast.visible}
        onClose={() => setToast((prev) => ({ ...prev, visible: false }))}
      />

      <div className="flex justify-between items-end mb-12 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl font-light uppercase tracking-tighter text-white mb-2">
            Portfolio <span className="font-bold">Manager</span>
          </h1>
          <p className="text-[10px] text-[#8a9a5b] uppercase tracking-[0.2em]">
            Admin Console v1.0
          </p>
        </div>
      </div>

      {/* Modern Tabs */}
      <div className="flex gap-12 mb-12 border-b border-white/5 pb-0">
        <button
          onClick={() => {
            setActiveTab("index");
            setEditingProject(undefined);
          }}
          className={cn(
            "text-xs uppercase tracking-[0.15em] transition-all relative py-4",
            activeTab === "index"
              ? "text-[#8a9a5b] font-bold after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-[#8a9a5b]"
              : "text-white/40 hover:text-white"
          )}
        >
          Index
        </button>
        <button
          onClick={() => setActiveTab("create")}
          className={cn(
            "text-xs uppercase tracking-[0.15em] transition-all relative py-4",
            activeTab === "create"
              ? "text-[#8a9a5b] font-bold after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-[#8a9a5b]"
              : "text-white/40 hover:text-white"
          )}
        >
          {editingProject ? `Edit: ${editingProject.title}` : "Create Entry"}
        </button>
      </div>

      {/* Content Area */}
      {activeTab === "create" ? (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <ProjectForm
            initialData={editingProject}
            onSubmit={handleSaveProject}
            isLoading={isSaving}
          />
        </div>
      ) : (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {isLoading ? (
            <div className="h-64 flex items-center justify-center text-[10px] uppercase tracking-widest text-[#8a9a5b]">
              <span className="animate-pulse">Loading Projects...</span>
            </div>
          ) : projects.length === 0 ? (
            <div className="h-64 flex items-center justify-center border border-dashed border-white/20 bg-white/5">
              <p className="text-xs text-white/40 uppercase tracking-widest">No projects found</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {/* Header - Fixed */}
              <div className="hidden md:grid grid-cols-12 gap-6 px-6 py-4 border-b border-white/10 text-[9px] uppercase tracking-widest text-white/40 font-medium bg-[#222222] z-10 sticky top-0">
                <div className="col-span-1">Preview</div>
                <div className="col-span-4">Project Info</div>
                <div className="col-span-4">Meta</div>
                <div className="col-span-3 text-right">Actions</div>
              </div>

              {/* Rows - Scrollable Container */}
              <div
                className="flex flex-col gap-2 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2 pb-10"
                data-lenis-prevent
              >
                {projects.map((project) => {
                  const thumbUrl = getDriveImage(project.image);

                  return (
                    <div
                      key={project.id || Math.random()}
                      className="group bg-[#1c1c1c]/40 border border-white/5 hover:border-[#8a9a5b]/50 hover:bg-white/5 transition-all duration-300 grid grid-cols-1 md:grid-cols-12 gap-6 items-center p-4 md:px-6 md:py-5 flex-shrink-0"
                    >
                      {/* Thumb */}
                      <div className="hidden md:block col-span-1 aspect-square bg-white/5 relative overflow-hidden ring-1 ring-white/10">
                        {thumbUrl ? (
                          <Image
                            src={thumbUrl}
                            alt={project.title}
                            fill
                            className="object-cover grayscale group-hover:grayscale-0 transition-all opacity-80 group-hover:opacity-100"
                          />
                        ) : (
                          <div className="w-full h-full bg-white/5" />
                        )}
                      </div>

                      {/* Details */}
                      <div className="col-span-4">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-white group-hover:text-[#8a9a5b] transition-colors">
                          {project.title}
                        </h3>
                        <p className="text-[10px] text-white/40 mt-1 font-mono truncate">
                          ID: {project.id}
                        </p>
                      </div>

                      {/* Meta */}
                      <div className="col-span-4 flex flex-col gap-1">
                        <span className="text-[10px] uppercase tracking-widest text-white/60">
                          {project.category}
                        </span>
                        <span className="text-[10px] font-mono text-[#8a9a5b]/70">
                          {project.year}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="col-span-3 flex justify-end gap-6 items-center">
                        <button
                          onClick={() => handleEdit(project)}
                          className="text-[10px] uppercase tracking-widest font-bold text-white/40 hover:text-[#8a9a5b] transition-colors border-b border-transparent hover:border-[#8a9a5b]"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(project.id)}
                          className="text-[10px] uppercase tracking-widest font-bold text-white/30 hover:text-red-500 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}