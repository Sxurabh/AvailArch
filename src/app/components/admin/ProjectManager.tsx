// src/app/components/admin/ProjectManager.tsx
"use client";
import { useState, useEffect } from "react";
import { Project } from "@/lib/data";
import ProjectForm from "./ProjectForm";
import { useRouter } from "next/navigation";

export default function ProjectManager() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [view, setView] = useState<"list" | "create" | "edit">("list");
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
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
    <div className="bg-white p-6 shadow-sm border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-light uppercase tracking-widest">Manage Portfolios</h2>
        <button 
            onClick={() => setView("create")}
            className="px-4 py-2 bg-black text-white text-xs uppercase tracking-widest hover:bg-neutral-800"
        >
            + Add New
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-gray-400">Loading projects...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 uppercase text-xs font-bold text-gray-500">
              <tr>
                <th className="p-3">Title</th>
                <th className="p-3">Category</th>
                <th className="p-3">Year</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {projects.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-3 font-medium text-black">{p.title}</td>
                  <td className="p-3">{p.category}</td>
                  <td className="p-3">{p.year}</td>
                  <td className="p-3 text-right space-x-2">
                    <button 
                      onClick={() => startEdit(p)}
                      className="text-blue-600 hover:underline text-xs uppercase tracking-wider"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(p.id)}
                      className="text-red-500 hover:underline text-xs uppercase tracking-wider"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {projects.length === 0 && (
                <tr>
                    <td colSpan={4} className="p-8 text-center text-gray-400">No projects found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}