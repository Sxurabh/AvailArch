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

  // Reusable Input Component to keep JSX clean
  const InputGroup = ({ label, name, value, placeholder, required = false, type = "text" }: any) => (
    <div className="space-y-1">
      <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400">{label}</label>
      <input 
        name={name} 
        required={required} 
        type={type}
        value={value || ""} 
        onChange={handleChange} 
        placeholder={placeholder}
        className="w-full px-3 py-2.5 text-xs bg-white border border-gray-200 focus:border-black focus:outline-none transition-colors rounded-sm text-black placeholder:text-gray-300" 
      />
    </div>
  );

  return (
    <div className="bg-white border border-gray-200">
        <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/30">
            <h3 className="text-[11px] uppercase tracking-[0.2em] font-bold text-black">
                {initialData ? `Editing: ${initialData.title}` : "New Project Entry"}
            </h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
            
            {/* Section: Basic Info */}
            <div className="space-y-4">
                <h4 className="text-[10px] uppercase tracking-widest text-black border-l-2 border-brand pl-3 mb-4">
                    Basic Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputGroup label="Project Title" name="title" value={formData.title} required />
                    <InputGroup label="Category" name="category" value={formData.category} placeholder="e.g. Residential" required />
                    <InputGroup label="Year" name="year" value={formData.year} required />
                    <InputGroup label="Client Name" name="client" value={formData.client} />
                    <InputGroup label="Location" name="location" value={formData.location} />
                </div>
            </div>

            {/* Section: Details */}
            <div className="space-y-4">
                <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400">Project Description</label>
                    <textarea 
                        name="description" 
                        rows={5} 
                        value={formData.description || ""} 
                        onChange={handleChange} 
                        className="w-full p-3 text-xs bg-white border border-gray-200 focus:border-black focus:outline-none transition-colors rounded-sm text-black resize-y"
                    />
                </div>
            </div>

            {/* Section: Media */}
            <div className="bg-gray-50 p-6 rounded-sm border border-gray-100 space-y-4">
                <div className="flex justify-between items-center mb-2">
                    <h4 className="text-[10px] uppercase tracking-widest text-black font-bold">Media Assets</h4>
                    <span className="text-[9px] text-gray-400 uppercase tracking-widest">Google Drive Links Supported</span>
                </div>
                
                <div className="space-y-4">
                     <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400">Main Cover Image URL</label>
                        <input name="image" required value={formData.image} onChange={handleChange} className="w-full p-2 border border-gray-200 text-[10px] font-mono focus:border-black focus:outline-none" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                         <div className="space-y-1">
                            <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400">Before Image (Slider)</label>
                            <input name="beforeImage" value={formData.beforeImage || ""} onChange={handleChange} className="w-full p-2 border border-gray-200 text-[10px] font-mono focus:border-black focus:outline-none" />
                        </div>
                         <div className="space-y-1">
                            <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400">After Image (Slider)</label>
                            <input name="afterImage" value={formData.afterImage || ""} onChange={handleChange} className="w-full p-2 border border-gray-200 text-[10px] font-mono focus:border-black focus:outline-none" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4 pt-4 border-t border-gray-100">
                <button 
                    type="button" 
                    onClick={onCancel} 
                    className="px-6 py-3 text-[10px] uppercase tracking-[0.2em] text-gray-500 hover:text-black transition-colors"
                >
                    Cancel
                </button>
                <button 
                    type="submit" 
                    disabled={isSaving}
                    className="px-8 py-3 bg-black text-white text-[10px] uppercase tracking-[0.2em] hover:bg-neutral-800 disabled:opacity-50 transition-colors"
                >
                    {isSaving ? "Saving..." : "Save Project"}
                </button>
            </div>
        </form>
    </div>
  );
}