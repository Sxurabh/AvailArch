// src/app/components/admin/ProjectManager.tsx
"use client";
import { useState, useEffect } from "react";
import { Project } from "@/lib/data";
import ProjectForm from "./ProjectForm";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function ProjectManager() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [view, setView] = useState<"list" | "create" | "edit">("list");
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // We don't strictly need isSaving here for the list view, but keeping state consistent
  const [isSaving, setIsSaving] = useState(false);
  
  const router = useRouter();

  // Fetch projects on load
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/projects", { cache: "no-store" });
      const data = await res.json();
      setProjects(data);
    } catch (error) {
      console.error("Failed to load projects", error);
    } finally {
      setIsLoading(false);
    }
  };

  // HANDLERS
  const handleCreate = async (data: Partial<Project>) => {
    setIsSaving(true);
    try {
      await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      await fetchProjects();
      setView("list");
      router.refresh();
    } catch (e) {
      alert("Error creating project");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdate = async (data: Partial<Project>) => {
    if (!editingProject) return;
    setIsSaving(true);
    try {
      await fetch(`/api/projects/${editingProject.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      await fetchProjects();
      setView("list");
      setEditingProject(null);
      router.refresh();
    } catch (e) {
      alert("Error updating project");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project? This cannot be undone.")) return;
    try {
      await fetch(`/api/projects/${id}`, { method: "DELETE" });
      setProjects(projects.filter(p => p.id !== id));
      router.refresh();
    } catch (e) {
      alert("Error deleting project");
    }
  };

  // RENDER HELPERS
  const startEdit = (p: Project) => {
    setEditingProject(p);
    setView("edit");
  };

  if (view === "create") {
    return <ProjectForm isSaving={isSaving} onSubmit={handleCreate} onCancel={() => setView("list")} />;
  }

  if (view === "edit" && editingProject) {
    return <ProjectForm isSaving={isSaving} initialData={editingProject} onSubmit={handleUpdate} onCancel={() => { setView("list"); setEditingProject(null); }} />;
  }

  return (
    <div className="bg-white border border-gray-200">
      {/* Header Section */}
      <div className="px-6 py-6 border-b border-gray-100 flex justify-between items-end bg-gray-50/30">
        <div>
            <h3 className="text-[11px] uppercase tracking-[0.2em] font-bold text-black mb-1">Portfolio Management</h3>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest">Manage your showcased work</p>
        </div>
        <button 
            onClick={() => setView("create")}
            className="px-5 py-2 bg-black text-white text-[10px] uppercase tracking-[0.2em] hover:bg-neutral-800 transition-colors"
        >
            + Add Project
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-[10px] uppercase tracking-widest text-gray-400">Loading projects...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white">
              <tr className="border-b border-gray-100">
                <th className="py-4 px-6 text-[10px] uppercase tracking-widest text-gray-400 font-medium w-1/3">Title</th>
                <th className="py-4 px-6 text-[10px] uppercase tracking-widest text-gray-400 font-medium">Category</th>
                <th className="py-4 px-6 text-[10px] uppercase tracking-widest text-gray-400 font-medium">Year</th>
                <th className="py-4 px-6 text-[10px] uppercase tracking-widest text-gray-400 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {projects.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="py-4 px-6">
                    <span className="block text-[11px] font-semibold text-black tracking-wide">{p.title}</span>
                    {p.client && <span className="text-[9px] text-gray-400 tracking-wider uppercase">{p.client}</span>}
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-[10px] uppercase tracking-widest text-gray-600 border border-gray-100 px-2 py-1 rounded-sm bg-white">
                        {p.category}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-[11px] text-gray-500 font-mono">
                    {p.year}
                  </td>
                  <td className="py-4 px-6 text-right space-x-4">
                    <button 
                      onClick={() => startEdit(p)}
                      className="text-[10px] uppercase tracking-widest font-semibold text-black hover:text-gray-500 transition-colors"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(p.id)}
                      className="text-[10px] uppercase tracking-widest font-semibold text-red-500 hover:text-red-700 transition-colors"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {projects.length === 0 && (
                <tr>
                    <td colSpan={4} className="py-12 text-center text-[10px] uppercase tracking-widest text-gray-400">No projects found. Start by adding one.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}