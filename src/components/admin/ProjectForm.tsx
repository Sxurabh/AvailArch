// src/components/admin/ProjectForm.tsx
"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { Project, normalizeGallery } from "@/lib/data";
import { Trash2, Plus, Image as ImageIcon, LayoutGrid, X as XIcon, Maximize } from "lucide-react";
import { cn } from "@/lib/utils";
import ImageUploader from "@/components/ui/ImageUploader";

interface ProjectFormProps {
  initialData?: Project;
  onSubmit: (data: Project) => void;
  isLoading?: boolean;
}

// 🟢 FIX: Added 'as const' to gridSize so it matches the Project type definition
const defaultEmptyValues = {
  title: "",
  image: "",
  year: new Date().getFullYear().toString(),
  category: "",
  description: "",
  gridColSpan: 1,
  gridRowSpan: 1,
  sections: [],
  spaces: [],
  gallery: [],
};

// --- CUSTOM INPUT COMPONENT ---
const ArchitecturalInput = ({ label, register, name, required, placeholder, ...props }: any) => (
  <div className="space-y-2 group">
    <label className="text-[9px] font-bold uppercase tracking-[0.15em] text-gray-400 group-focus-within:text-[#1c1c1c] transition-colors">
      {label}
    </label>
    <input
      {...register(name, { required })}
      placeholder={placeholder}
      className="w-full pb-2 bg-transparent border-b border-gray-200 focus:border-[#8a9a5b] transition-colors outline-none text-sm font-medium placeholder:text-gray-300 font-mono"
      {...props}
    />
  </div>
);

export default function ProjectForm({ initialData, onSubmit, isLoading }: ProjectFormProps) {

  const { register, control, handleSubmit, watch, reset } = useForm<Project>({
    defaultValues: defaultEmptyValues as any,
  });

  useEffect(() => {
    if (initialData) {
      reset({
        ...initialData,
        // Ensure defaults if fields are missing
        gridColSpan: initialData.gridColSpan || 1,
        gridRowSpan: initialData.gridRowSpan || 1,
        sections: initialData.sections || [],
        spaces: initialData.spaces || [],
        gallery: normalizeGallery(initialData.gallery),
      });
    } else {
      reset(defaultEmptyValues);
    }
  }, [initialData, reset]);

  const { fields: sectionFields, append: appendSection, remove: removeSection } = useFieldArray({
    control, name: "sections"
  });
  const { fields: spaceFields, append: appendSpace, remove: removeSpace } = useFieldArray({
    control, name: "spaces"
  });
  const { fields: galleryFields, append: appendGallery, remove: removeGallery } = useFieldArray({
    control, name: "gallery" as any
  });

  const [activeTab, setActiveTab] = useState<"general" | "hero" | "spaces" | "gallery">("general");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-24">

      {/* TABS */}
      <div className="lg:col-span-3 flex lg:flex-col overflow-x-auto lg:overflow-visible gap-8 lg:gap-4 border-b lg:border-b-0 lg:border-r border-gray-100 pb-4 lg:pb-0 lg:pr-8 h-fit">
        {["general", "hero", "spaces", "gallery"].map((tab) => (
          <button
            type="button"
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={cn(
              "text-xs uppercase tracking-[0.2em] text-left transition-all py-2 px-2 border-l-2",
              activeTab === tab
                ? "border-[#8a9a5b] text-[#1c1c1c] font-bold pl-4 bg-gray-50"
                : "border-transparent text-gray-400 hover:text-[#1c1c1c] hover:pl-4"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* CONTENT */}
      <div className="lg:col-span-9 min-h-[500px]">

        {/* --- TAB 1: GENERAL INFO --- */}
        <div className={activeTab === "general" ? "block animate-in fade-in" : "hidden"}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
            <ArchitecturalInput label="Project Title" register={register} name="title" required placeholder="Project Name" />
            <ArchitecturalInput label="Year" register={register} name="year" placeholder="2024" />
            <ArchitecturalInput label="Category" register={register} name="category" placeholder="Residential" />
            <ArchitecturalInput label="Main Image URL (or upload below)" register={register} name="image" required placeholder="URL or Google Drive link" />

            {/* Image Uploader for Main Image */}
            <div className="md:col-span-2">
              <Controller
                control={control}
                name="image"
                render={({ field: { onChange, value } }) => (
                  <ImageUploader
                    label="Upload Main Image"
                    bucket="project-images"
                    maxFiles={1}
                    value={value ? [value] : []}
                    onChange={(urls) => onChange(urls[0] || "")}
                  />
                )}
              />
            </div>

            {/* 🟢 NEW GRID SIZE SELECTOR USING COL/ROW SPANS */}
            <div className="grid grid-cols-2 gap-4 w-full">
              <ArchitecturalInput label="Grid Col Span" register={register} name="gridColSpan" type="number" placeholder="1" />
              <ArchitecturalInput label="Grid Row Span" register={register} name="gridRowSpan" type="number" placeholder="1" />
            </div>

            <div className="md:col-span-2 space-y-2 mt-4 group">
              <label className="text-[9px] font-bold uppercase tracking-[0.15em] text-gray-400 group-focus-within:text-[#1c1c1c]">Description</label>
              <textarea
                {...register("description")}
                rows={5}
                className="w-full p-4 bg-gray-50/50 border border-gray-100 focus:border-[#8a9a5b] transition-colors outline-none text-sm font-mono resize-none"
                placeholder="Project details..."
              />
            </div>
          </div>
        </div>

        {/* --- TAB 2: HERO --- */}
        <div className={activeTab === "hero" ? "block animate-in fade-in" : "hidden"}>
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-sm font-bold uppercase tracking-widest">Hero Sections</h3>
            <button
              type="button"
              onClick={() => appendSection({ title: "New Section", images: [] })}
              className="flex items-center gap-2 text-[10px] bg-[#1c1c1c] text-white hover:bg-[#8a9a5b] hover:text-[#1c1c1c] px-4 py-3 uppercase tracking-widest transition-colors"
            >
              <Plus size={14} /> Add Section
            </button>
          </div>

          <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar" data-lenis-prevent>
            {sectionFields.map((field, index) => (
              <div key={field.id} className="p-6 bg-gray-50 border border-gray-100 relative group transition-all hover:shadow-sm">
                <button
                  type="button"
                  onClick={() => removeSection(index)}
                  className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
                <div className="grid gap-6">
                  <ArchitecturalInput label="Section Title" register={register} name={`sections.${index}.title` as const} required />
                  <div className="space-y-2">
                    <Controller
                      control={control}
                      name={`sections.${index}.images` as const}
                      render={({ field: { onChange, value } }) => (
                        <ImageUploader
                          label={`Section Images`}
                          bucket="project-images"
                          maxFiles={10}
                          value={Array.isArray(value) ? value : []}
                          onChange={onChange}
                        />
                      )}
                    />
                  </div>
                </div>
              </div>
            ))}
            {sectionFields.length === 0 && <p className="text-xs text-gray-400 italic">No hero sections added.</p>}
          </div>
        </div>

        {/* --- TAB 3: SPACES --- */}
        <div className={activeTab === "spaces" ? "block animate-in fade-in" : "hidden"}>
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-sm font-bold uppercase tracking-widest">Process Spaces</h3>
            <button
              type="button"
              onClick={() => appendSpace({ name: "New Space", mainImage: "", slider2d: "", slider3d: "" })}
              className="flex items-center gap-2 text-[10px] bg-[#1c1c1c] text-white hover:bg-[#8a9a5b] hover:text-[#1c1c1c] px-4 py-3 uppercase tracking-widest transition-colors"
            >
              <Plus size={14} /> Add Space
            </button>
          </div>

          <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar" data-lenis-prevent>
            {spaceFields.map((field, index) => (
              <div key={field.id} className="p-6 bg-gray-50 border border-gray-100 relative">
                <button
                  type="button"
                  onClick={() => removeSpace(index)}
                  className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={16} />
                </button>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <ArchitecturalInput label="Space Name" register={register} name={`spaces.${index}.name` as const} required />
                  </div>
                  <ArchitecturalInput label="Main Image ID" register={register} name={`spaces.${index}.mainImage` as const} />
                  <div className="hidden md:block" />
                  <ArchitecturalInput label="2D Drawing ID" register={register} name={`spaces.${index}.slider2d` as const} />
                  <ArchitecturalInput label="3D Render ID" register={register} name={`spaces.${index}.slider3d` as const} />
                </div>
              </div>
            ))}
            {spaceFields.length === 0 && <p className="text-xs text-gray-400 italic">No spaces added.</p>}
          </div>
        </div>

        {/* --- TAB 4: GALLERY --- */}
        <div className={activeTab === "gallery" ? "block animate-in fade-in" : "hidden"}>
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-sm font-bold uppercase tracking-widest">Gallery</h3>
            <button
              type="button"
              onClick={() => appendGallery({ id: "", size: "normal" })}
              className="flex items-center gap-2 text-[10px] bg-[#1c1c1c] text-white hover:bg-[#8a9a5b] hover:text-[#1c1c1c] px-4 py-3 uppercase tracking-widest transition-colors"
            >
              <Plus size={14} /> Add Image
            </button>
          </div>

          <div className="max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar" data-lenis-prevent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {galleryFields.map((field, index) => (
                <div key={field.id} className="p-4 bg-gray-50 border border-gray-100 flex flex-col gap-3 group relative hover:border-black transition-colors">
                  <button
                    type="button"
                    onClick={() => removeGallery(index)}
                    className="absolute top-2 right-2 text-gray-300 hover:text-red-500 transition-colors"
                  >
                    <XIcon size={14} />
                  </button>

                  <ArchitecturalInput label="Image ID" register={register} name={`gallery.${index}.id` as const} required />

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase tracking-[0.15em] text-gray-400">Grid Size</label>
                    <select
                      {...register(`gallery.${index}.size` as const)}
                      className="w-full pb-2 bg-transparent border-b border-gray-200 focus:border-[#8a9a5b] outline-none text-xs uppercase cursor-pointer"
                    >
                      <option value="normal">Normal</option>
                      <option value="wide">Wide</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2 mt-2 pt-2">
                    {watch(`gallery.${index}.size` as any) === "wide" ? <LayoutGrid size={14} /> : <ImageIcon size={14} />}
                    <span className="text-[9px] text-gray-500 uppercase tracking-widest">
                      {watch(`gallery.${index}.size` as any) === "wide" ? "Wide Span" : "Standard"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            {galleryFields.length === 0 && <p className="text-xs text-gray-400 italic">No gallery images added.</p>}
          </div>
        </div>

        <div className="pt-12 border-t border-gray-100 flex justify-end mt-8">
          <button
            type="submit"
            disabled={isLoading}
            className="bg-[#1c1c1c] text-white hover:bg-[#8a9a5b] hover:text-[#1c1c1c] transition-all px-10 py-4 uppercase tracking-[0.2em] text-xs font-bold disabled:opacity-50"
          >
            {isLoading ? "Saving..." : "Save Project Changes"}
          </button>
        </div>
      </div>
    </form>
  );
}