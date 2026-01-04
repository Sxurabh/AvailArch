// src/app/components/admin/ProjectForm.tsx
"use client";
import { useState } from "react";
import { Project } from "@/lib/data";

interface ProjectFormProps {
  initialData?: Partial<Project>;
  onSubmit: (data: Partial<Project>) => Promise<void>;
  onCancel: () => void;
  isSaving: boolean;
}

export default function ProjectForm({ initialData, onSubmit, onCancel, isSaving }: ProjectFormProps) {
  const [formData, setFormData] = useState<Partial<Project>>({
    title: "",
    category: "",
    year: new Date().getFullYear().toString(),
    image: "",
    description: "",
    client: "",
    location: "",
    beforeImage: "",
    afterImage: "",
    ...initialData,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 border border-gray-200 shadow-sm  space-y-4">
      <h3 className="text-lg font-bold mb-4">{initialData ? "Edit Project" : "New Project"}</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs uppercase font-bold text-gray-500">Title</label>
          <input name="title" required value={formData.title} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded" />
        </div>
        <div className="space-y-1">
          <label className="text-xs uppercase font-bold text-gray-500">Category</label>
          <input name="category" required value={formData.category} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded" placeholder="e.g. Residential" />
        </div>
        <div className="space-y-1">
          <label className="text-xs uppercase font-bold text-gray-500">Year</label>
          <input name="year" required value={formData.year} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded" />
        </div>
        <div className="space-y-1">
            <label className="text-xs uppercase font-bold text-gray-500">Client</label>
            <input name="client" value={formData.client || ""} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded" />
        </div>
      </div>

      <div className="space-y-1">
         <label className="text-xs uppercase font-bold text-gray-500">Description</label>
         <textarea name="description" rows={4} value={formData.description || ""} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded" />
      </div>

      {/* Image Section */}
      <div className="bg-gray-50 p-4  space-y-4">
        <p className="text-xs font-bold uppercase text-gray-400">Images (Paste Google Drive Links)</p>
        <div className="space-y-1">
            <label className="text-xs text-gray-500">Main Image URL</label>
            <input name="image" required value={formData.image} onChange={handleChange} className="w-full p-2 border border-gray-300 text-sm font-mono" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
                <label className="text-xs text-gray-500">Before Image (Optional)</label>
                <input name="beforeImage" value={formData.beforeImage || ""} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded text-sm font-mono" />
            </div>
            <div className="space-y-1">
                <label className="text-xs text-gray-500">After Image (Optional)</label>
                <input name="afterImage" value={formData.afterImage || ""} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded text-sm font-mono" />
            </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm text-gray-600 hover:text-black">Cancel</button>
        <button 
          type="submit" 
          disabled={isSaving}
          className="px-6 py-2 bg-black text-white text-sm uppercase tracking-widest hover:bg-neutral-800 disabled:opacity-50"
        >
          {isSaving ? "Saving..." : "Save Project"}
        </button>
      </div>
    </form>
  );
}