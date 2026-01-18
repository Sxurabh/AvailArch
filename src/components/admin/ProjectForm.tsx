"use client";

import { useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { Project, ProjectSection, ProjectSpace, ProjectGalleryItem, normalizeGallery } from "@/lib/data";
import { Trash2, Plus, GripVertical, Image as ImageIcon, LayoutGrid } from "lucide-react";

interface ProjectFormProps {
  initialData?: Project;
  onSubmit: (data: Project) => void;
  isLoading?: boolean;
}

export default function ProjectForm({ initialData, onSubmit, isLoading }: ProjectFormProps) {
  // normalize gallery for the form state
  const defaultValues = {
    ...initialData,
    sections: initialData?.sections || [],
    spaces: initialData?.spaces || [],
    gallery: normalizeGallery(initialData?.gallery),
  };

  const { register, control, handleSubmit, watch, formState: { errors } } = useForm<Project>({
    defaultValues: defaultValues as any,
  });

  // --- FIELD ARRAYS FOR DYNAMIC LISTS ---
  
  // 1. Hero Sections (Carousel)
  const { fields: sectionFields, append: appendSection, remove: removeSection } = useFieldArray({
    control,
    name: "sections",
  });

  // 2. Spaces (Design Process)
  const { fields: spaceFields, append: appendSpace, remove: removeSpace } = useFieldArray({
    control,
    name: "spaces",
  });

  // 3. Gallery (Final Execution)
  const { fields: galleryFields, append: appendGallery, remove: removeGallery } = useFieldArray({
    control,
    name: "gallery" as any, // Cast because usage is slightly complex with unions
  });

  const [activeTab, setActiveTab] = useState<"general" | "hero" | "spaces" | "gallery">("general");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 bg-white p-8 rounded-xl shadow-sm border border-gray-200">
      
      {/* TABS HEADER */}
      <div className="flex border-b border-gray-100 mb-8">
        {["general", "hero", "spaces", "gallery"].map((tab) => (
          <button
            type="button"
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-6 py-3 text-sm font-medium uppercase tracking-widest transition-colors relative ${
              activeTab === tab ? "text-black" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            {tab}
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 w-full h-[2px] bg-black" />
            )}
          </button>
        ))}
      </div>

      {/* --- TAB 1: GENERAL INFO --- */}
      <div className={activeTab === "general" ? "block" : "hidden"}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Project Title</label>
            <input {...register("title", { required: true })} className="w-full p-3 bg-gray-50 border border-gray-200 focus:border-black transition-colors outline-none" placeholder="e.g. Modern Villa" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Main Image ID</label>
            <input {...register("image", { required: true })} className="w-full p-3 bg-gray-50 border border-gray-200 focus:border-black transition-colors outline-none" placeholder="Google Drive ID" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Year</label>
            <input {...register("year")} className="w-full p-3 bg-gray-50 border border-gray-200 focus:border-black transition-colors outline-none" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Category</label>
            <input {...register("category")} className="w-full p-3 bg-gray-50 border border-gray-200 focus:border-black transition-colors outline-none" />
          </div>
          <div className="md:col-span-2 space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Description</label>
            <textarea {...register("description")} rows={4} className="w-full p-3 bg-gray-50 border border-gray-200 focus:border-black transition-colors outline-none" />
          </div>
        </div>
      </div>

      {/* --- TAB 2: HERO CAROUSEL SECTIONS --- */}
      <div className={activeTab === "hero" ? "block space-y-6" : "hidden"}>
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold uppercase tracking-widest">Hero Sections</h3>
            <button
                type="button"
                onClick={() => appendSection({ title: "New Section", images: [] })}
                className="flex items-center gap-2 text-[10px] bg-black text-white px-4 py-2 uppercase tracking-widest hover:bg-neutral-800"
            >
                <Plus size={14} /> Add Section
            </button>
        </div>

        {sectionFields.map((field, index) => (
          <div key={field.id} className="p-6 bg-gray-50 border border-gray-200 rounded-lg relative group">
            <button
                type="button"
                onClick={() => removeSection(index)}
                className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
            >
                <Trash2 size={18} />
            </button>
            
            <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Section Title</label>
                    <input 
                        {...register(`sections.${index}.title` as const, { required: true })} 
                        className="w-full p-2 bg-white border border-gray-200 focus:border-black outline-none"
                        placeholder="e.g. Living Area" 
                    />
                </div>
                
                {/* Nested Image Array Handling (Simplified as comma separated string for easy editing) */}
                <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Images (Comma Separated IDs)</label>
                    <Controller
                        control={control}
                        name={`sections.${index}.images` as const}
                        render={({ field: { onChange, value } }) => (
                            <textarea 
                                className="w-full p-2 bg-white border border-gray-200 focus:border-black outline-none font-mono text-xs"
                                rows={2}
                                placeholder="ID1, ID2, ID3"
                                value={Array.isArray(value) ? value.join(", ") : value}
                                onChange={(e) => onChange(e.target.value.split(",").map(s => s.trim()).filter(Boolean))}
                            />
                        )}
                    />
                    <p className="text-[10px] text-gray-400">Paste Google Drive IDs separated by commas.</p>
                </div>
            </div>
          </div>
        ))}
      </div>

      {/* --- TAB 3: SPACES (DESIGN PROCESS) --- */}
      <div className={activeTab === "spaces" ? "block space-y-6" : "hidden"}>
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold uppercase tracking-widest">Process Spaces</h3>
             <button
                type="button"
                onClick={() => appendSpace({ name: "New Space", mainImage: "", slider2d: "", slider3d: "" })}
                className="flex items-center gap-2 text-[10px] bg-black text-white px-4 py-2 uppercase tracking-widest hover:bg-neutral-800"
            >
                <Plus size={14} /> Add Space
            </button>
        </div>

        {spaceFields.map((field, index) => (
            <div key={field.id} className="p-6 bg-gray-50 border border-gray-200 rounded-lg relative">
                <button
                    type="button"
                    onClick={() => removeSpace(index)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
                >
                    <Trash2 size={18} />
                </button>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2 space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Space Name</label>
                        <input 
                            {...register(`spaces.${index}.name` as const, { required: true })} 
                            className="w-full p-2 bg-white border border-gray-200 focus:border-black outline-none"
                            placeholder="e.g. Master Bedroom" 
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Main Concept Image ID</label>
                        <input 
                            {...register(`spaces.${index}.mainImage` as const)} 
                            className="w-full p-2 bg-white border border-gray-200 focus:border-black outline-none font-mono text-xs"
                        />
                    </div>

                    <div className="space-y-2">
                         {/* Empty Spacer or Additional options */}
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">2D Drawing ID (Before)</label>
                        <input 
                            {...register(`spaces.${index}.slider2d` as const)} 
                            className="w-full p-2 bg-white border border-gray-200 focus:border-black outline-none font-mono text-xs"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">3D Render ID (After)</label>
                        <input 
                            {...register(`spaces.${index}.slider3d` as const)} 
                            className="w-full p-2 bg-white border border-gray-200 focus:border-black outline-none font-mono text-xs"
                        />
                    </div>
                </div>
            </div>
        ))}
      </div>

      {/* --- TAB 4: FINAL GALLERY (GRID CONTROL) --- */}
      <div className={activeTab === "gallery" ? "block space-y-6" : "hidden"}>
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold uppercase tracking-widest">Execution Gallery</h3>
             <button
                type="button"
                onClick={() => appendGallery({ id: "", size: "normal" })}
                className="flex items-center gap-2 text-[10px] bg-black text-white px-4 py-2 uppercase tracking-widest hover:bg-neutral-800"
            >
                <Plus size={14} /> Add Image
            </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {galleryFields.map((field, index) => (
                <div key={field.id} className="p-4 bg-gray-50 border border-gray-200 rounded-lg flex flex-col gap-3 group relative">
                    <button
                        type="button"
                        onClick={() => removeGallery(index)}
                        className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md text-gray-400 hover:text-red-500 border border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <XIcon size={14} />
                    </button>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Image ID</label>
                        <input 
                            {...register(`gallery.${index}.id` as const, { required: true })} 
                            className="w-full p-2 bg-white border border-gray-200 focus:border-black outline-none font-mono text-xs"
                            placeholder="Drive ID"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Grid Size</label>
                        <select
                            {...register(`gallery.${index}.size` as const)}
                            className="w-full p-2 bg-white border border-gray-200 focus:border-black outline-none text-xs uppercase"
                        >
                            <option value="normal">Normal (1 Col)</option>
                            <option value="wide">Wide (2 Cols)</option>
                        </select>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-200">
                        {watch(`gallery.${index}.size` as any) === "wide" ? (
                            <LayoutGrid size={16} className="text-black" />
                        ) : (
                            <ImageIcon size={16} className="text-gray-400" />
                        )}
                        <span className="text-[10px] text-gray-500 uppercase tracking-widest">
                            {watch(`gallery.${index}.size` as any) === "wide" ? "Wide Span" : "Standard"}
                        </span>
                    </div>
                </div>
            ))}
        </div>
      </div>

      {/* SUBMIT */}
      <div className="pt-8 border-t border-gray-100 flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="bg-black text-white px-8 py-3 uppercase tracking-widest text-xs hover:bg-gray-900 transition-colors disabled:opacity-50"
        >
          {isLoading ? "Saving Project..." : "Save Project Changes"}
        </button>
      </div>
    </form>
  );
}

function XIcon({size, className}: {size?: number, className?: string}) {
    return (
        <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width={size || 24} 
            height={size || 24} 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className={className}
        >
            <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
        </svg>
    )
}