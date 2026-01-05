// src/components/admin/ProjectManager.tsx
"use client";

import { useState, useEffect } from "react";
import ProjectForm from "./ProjectForm";
import Image from "next/image";
import { cn } from "@/lib/utils";

export default function ProjectManager() {
  const [projects, setProjects] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("index"); // 'index' | 'create'
  const [editingProject, setEditingProject] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, [activeTab]);

  async function fetchProjects() {
    try {
      const res = await fetch("/api/projects");
      const data = await res.json();
      setProjects(data.reverse()); // Newest first
    } catch (error) {
      console.error("Failed to fetch projects", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Irreversible action. Delete this project?")) return;
    try {
      await fetch(`/api/projects?id=${id}`, { method: "DELETE" });
      setProjects(projects.filter((p) => p._id !== id));
    } catch (error) {
      console.error("Failed to delete", error);
    }
  }

  const handleEdit = (project: any) => {
    setEditingProject(project);
    setActiveTab("create");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSuccess = () => {
    setEditingProject(null);
    setActiveTab("index");
    fetchProjects();
  };

  return (
    <div className="max-w-4xl mx-auto pt-12 min-h-[60vh] animate-in fade-in slide-in-from-bottom-4">
      <h1 className="text-2xl font-light uppercase tracking-widest mb-2">
        Portfolio Manager
      </h1>
      <p className="text-xs text-gray-400 mb-12 uppercase tracking-wider">
        Admin Console
      </p>

      {/* Tabs - Identical to Track Request */}
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
          existingProject={editingProject}
          onSuccess={handleSuccess}
          onCancel={() => {
            setEditingProject(null);
            setActiveTab("index");
          }}
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
                  key={project._id}
                  className="group bg-white border border-transparent hover:border-gray-100 p-4 md:p-0 md:py-4 md:border-b md:border-gray-50 grid grid-cols-1 md:grid-cols-12 gap-4 items-center transition-all"
                >
                  {/* Thumb */}
                  <div className="hidden md:block col-span-1 relative h-10 w-10 bg-gray-100 overflow-hidden">
                    {project.imageUrl && (
                      <Image
                        src={project.imageUrl}
                        alt="thumb"
                        fill
                        className="object-cover grayscale group-hover:grayscale-0 transition-all"
                      />
                    )}
                  </div>

                  {/* Details */}
                  <div className="col-span-5">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-black">
                      {project.title}
                    </h3>
                    <p className="text-[10px] text-gray-400 mt-1 line-clamp-1 font-mono">
                      {project.description}
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
                      onClick={() => handleDelete(project._id)}
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