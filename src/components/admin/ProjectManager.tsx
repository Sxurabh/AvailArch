// src/app/components/admin/ProjectManager.tsx
"use client";
import { useState, useEffect } from "react";
import { Project } from "@/lib/data";
import ProjectForm from "./ProjectForm";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

// Visual consistency with Dashboard icons
const Icons = {
  Plus: () => <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>,
  Edit: () => <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
  Trash: () => <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
};

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
      <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
        <div>
            <h3 className="text-[11px] uppercase tracking-widest font-semibold text-black">Portfolio Management</h3>
            {/* Optional sub-label if you want to match dashboard exactly */}
        </div>
        <button 
            onClick={() => setView("create")}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white text-[10px] uppercase tracking-widest hover:bg-neutral-800 transition-colors"
        >
            <Icons.Plus /> Add Project
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
                  <td className="py-4 px-6 text-right">
                    <div className="flex justify-end gap-3">
                        <button 
                        onClick={() => startEdit(p)}
                        className="text-gray-400 hover:text-blue-600 transition-colors"
                        title="Edit"
                        >
                        <Icons.Edit />
                        </button>
                        <button 
                        onClick={() => handleDelete(p.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        title="Delete"
                        >
                        <Icons.Trash />
                        </button>
                    </div>
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