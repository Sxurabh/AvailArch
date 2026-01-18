// src/components/admin/ProjectManager.tsx
"use client";

import { useState, useEffect } from "react";
import ProjectForm from "./ProjectForm";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Project } from "@/lib/data"; // Ensure you import the type if available, or use 'any'

export default function ProjectManager() {
  const [projects, setProjects] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"index" | "create">("index");
  const [editingProject, setEditingProject] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

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
    } finally {
      setIsLoading(false);
    }
  }

  // --- CRUD OPERATIONS ---

  async function handleSaveProject(formData: Project) {
    setIsSaving(true);
    try {
      let res;
      if (editingProject && editingProject.id) {
        // UPDATE Existing
        res = await fetch(`/api/projects/${editingProject.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      } else {
        // CREATE New
        res = await fetch("/api/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      }

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save");
      }

      // Success! Reset states
      alert("Project saved successfully!");
      setEditingProject(null);
      setActiveTab("index");
      fetchProjects(); // Refresh list

    } catch (error: any) {
      console.error("Save Error:", error);
      alert(`Error saving project: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Irreversible action. Delete this project?")) return;
    
    if (!id) {
        alert("Error: Invalid Project ID");
        return;
    }

    try {
      const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
      
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to delete");
      }

      // Optimistic update
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch (error: any) {
      console.error("Failed to delete", error);
      alert(`Error: ${error.message}`);
    }
  }

  const handleEdit = (project: any) => {
    setEditingProject(project);
    setActiveTab("create");
    // Scroll to top to see form
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="max-w-4xl mx-auto pt-12 min-h-[60vh] animate-in fade-in slide-in-from-bottom-4">
      <h1 className="text-2xl font-light uppercase tracking-widest mb-2">
        Portfolio Manager
      </h1>
      <p className="text-xs text-gray-400 mb-12 uppercase tracking-wider">
        Admin Console
      </p>

      {/* Tabs */}
      <div className="flex gap-8 border-b border-gray-100 mb-12">
        <button
          onClick={() => {
            setActiveTab("index");
            setEditingProject(null);
          }}
          className={cn(
            "pb-3 text-[10px] uppercase tracking-[0.2em] transition-all outline-none",
            activeTab === "index"
              ? "border-b border-black text-black"
              : "text-gray-400 hover:text-black"
          )}
        >
          Project Index
        </button>
        <button
          onClick={() => setActiveTab("create")}
          className={cn(
            "pb-3 text-[10px] uppercase tracking-[0.2em] transition-all outline-none",
            activeTab === "create"
              ? "border-b border-black text-black"
              : "text-gray-400 hover:text-black"
          )}
        >
          {editingProject ? "Edit Entry" : "Create New"}
        </button>
      </div>

      {/* Content Area */}
      {activeTab === "create" ? (
        <ProjectForm
          initialData={editingProject}
          onSubmit={handleSaveProject}
          isLoading={isSaving}
        />
      ) : (
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-[10px] uppercase tracking-widest text-gray-400 animate-pulse">
              Syncing Data...
            </div>
          ) : projects.length === 0 ? (
            <p className="text-xs text-gray-400 italic">No projects found.</p>
          ) : (
            <div className="grid gap-4">
              {/* Header Row */}
              <div className="hidden md:grid grid-cols-12 gap-4 pb-2 border-b border-gray-100 text-[10px] uppercase tracking-widest text-gray-400">
                <div className="col-span-1">Thumb</div>
                <div className="col-span-5">Project Details</div>
                <div className="col-span-3">Category</div>
                <div className="col-span-3 text-right">Actions</div>
              </div>

              {/* Rows */}
              {projects.map((project) => (
                <div
                  key={project.id || Math.random()} 
                  className="group bg-white border border-transparent hover:border-gray-100 p-4 md:p-0 md:py-4 md:border-b md:border-gray-50 grid grid-cols-1 md:grid-cols-12 gap-4 items-center transition-all"
                >
                  {/* Thumb */}
                  <div className="hidden md:block col-span-1 relative h-10 w-10 bg-gray-100 overflow-hidden">
                    {/* Assuming image ID is stored in project.image, you might need a helper to convert ID to URL */}
                    <div className="w-full h-full bg-gray-200" />
                  </div>

                  {/* Details */}
                  <div className="col-span-5">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-black">
                      {project.title}
                    </h3>
                    <p className="text-[10px] text-gray-400 mt-1 line-clamp-1 font-mono">
                      {project.id}
                    </p>
                  </div>

                  {/* Category */}
                  <div className="col-span-3 flex items-center">
                    <span className="text-[9px] uppercase tracking-widest border border-gray-100 px-2 py-1 text-gray-500">
                      {project.category}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="col-span-3 flex justify-end gap-6 md:gap-4 pr-2">
                    <button
                      onClick={() => handleEdit(project)}
                      className="text-[10px] uppercase tracking-widest font-bold text-gray-400 hover:text-black transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(project.id)} 
                      className="text-[10px] uppercase tracking-widest font-bold text-gray-300 hover:text-red-500 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}