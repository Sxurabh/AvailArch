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
  status: "active" as "active" | "draft" | "archived",
  scheduledFor: "",
  gridColSpan: 1,
  gridRowSpan: 1,
  sections: [],
  spaces: [],
  gallery: [],
};

// --- CUSTOM INPUT COMPONENT ---
const ArchitecturalInput = ({ label, register, name, required, placeholder, ...props }: any) => (
  <div className="space-y-2 group">
    <label
      htmlFor={name}
      className="text-[9px] font-bold uppercase tracking-[0.15em] text-[rgba(var(--fg),0.5)] group-focus-within:text-[#1c1c1c] transition-colors"
    >
      {label}
    </label>
    <input
      id={name}
      {...register(name, { required })}
      placeholder={placeholder}
      className="w-full pb-2 bg-transparent border-b border-[rgba(var(--fg),0.2)] focus:border-[#8a9a5b] transition-colors outline-none text-sm font-medium placeholder:text-[rgba(var(--fg),0.4)] font-mono"
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
      <div className="lg:col-span-3 flex lg:flex-col overflow-x-auto lg:overflow-visible gap-8 lg:gap-4 border-b lg:border-b-0 lg:border-r border-[rgba(var(--fg),0.1)] pb-4 lg:pb-0 lg:pr-8 h-fit">
        {["general", "hero", "spaces", "gallery"].map((tab) => (
          <button
            type="button"
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={cn(
              "text-xs uppercase tracking-[0.2em] text-left transition-all py-2 px-2 border-l-2",
              activeTab === tab
                ? "border-[#8a9a5b] text-[#1c1c1c] font-bold pl-4 bg-[rgba(var(--fg),0.05)]"
                : "border-transparent text-[rgba(var(--fg),0.5)] hover:text-[#1c1c1c] hover:pl-4"
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
            {/* Image Uploader for Main Image (Now Default) */}
            <div className="md:col-span-2">
              <Controller
                control={control}
                name="image"
                render={({ field: { onChange, value } }) => (
                  <ImageUploader
                    label="Main Project Image"
                    bucket="project-images"
                    maxFiles={1}
                    value={value ? [value] : []}
                    onChange={(urls) => {
                      onChange(urls[0] || "");
                      // Auto-save when an image is successfully uploaded to this field
                      setTimeout(() => handleSubmit(onSubmit)(), 0);
                    }}
                  />
                )}
              />
            </div>

            {/* 🟢 NEW VISIBILITY & SCHEDULING CONTROLS */}
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 bg-[rgba(var(--fg),0.02)] p-6 border border-[rgba(var(--fg),0.1)]">
              <div className="space-y-2 group">
                <label
                  htmlFor="status"
                  className="text-[9px] font-bold uppercase tracking-[0.15em] text-[rgba(var(--fg),0.5)] group-focus-within:text-[#1c1c1c] transition-colors"
                >
                  Project Status
                </label>
                <select
                  id="status"
                  {...register("status")}
                  className="w-full pb-2 bg-transparent border-b border-[rgba(var(--fg),0.2)] focus:border-[#8a9a5b] transition-colors outline-none text-sm font-medium uppercase cursor-pointer"
                >
                  <option value="active">Active (Visible)</option>
                  <option value="draft">Draft (Hidden)</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              {watch("status") === "draft" && (
                <div className="space-y-2 group animate-in fade-in slide-in-from-top-2 duration-300">
                  <label
                    htmlFor="scheduledFor"
                    className="text-[9px] font-bold uppercase tracking-[0.15em] text-[rgba(var(--fg),0.5)] group-focus-within:text-[#8a9a5b] transition-colors flex justify-between"
                  >
                    <span>Schedule Publish Date (Optional)</span>
                  </label>
                  <input
                    type="datetime-local"
                    id="scheduledFor"
                    {...register("scheduledFor")}
                    className="w-full pb-2 bg-transparent border-b border-[rgba(var(--fg),0.2)] focus:border-[#8a9a5b] transition-colors outline-none text-sm font-medium text-[rgba(var(--fg),0.8)]"
                  />
                  <p className="text-[10px] text-[rgba(var(--fg),0.4)] mt-1">Leave empty to keep as manual draft.</p>
                </div>
              )}
            </div>

            {/* 🟢 NEW GRID SIZE SELECTOR USING COL/ROW SPANS */}
            <div className="grid grid-cols-2 gap-4 w-full md:col-span-2">
              <ArchitecturalInput label="Grid Col Span" register={register} name="gridColSpan" type="number" placeholder="1" />
              <ArchitecturalInput label="Grid Row Span" register={register} name="gridRowSpan" type="number" placeholder="1" />
            </div>

            <div className="md:col-span-2 space-y-2 mt-4 group">
              <label
                htmlFor="description"
                className="text-[9px] font-bold uppercase tracking-[0.15em] text-[rgba(var(--fg),0.5)] group-focus-within:text-[#1c1c1c]"
              >
                Description
              </label>
              <textarea
                id="description"
                {...register("description")}
                rows={5}
                className="w-full p-4 bg-[rgba(var(--fg),0.02)] border border-[rgba(var(--fg),0.1)] focus:border-[#8a9a5b] transition-colors outline-none text-sm font-mono resize-none custom-scrollbar"
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
              className="flex items-center gap-2 text-[10px] bg-[rgba(var(--bg),1)] text-[rgba(var(--fg),1)] hover:bg-[#8a9a5b] hover:text-[#1c1c1c] px-4 py-3 uppercase tracking-widest transition-colors"
            >
              <Plus size={14} /> Add Hero Section
            </button>
          </div>

          <div className="mb-8 p-6 bg-[rgba(var(--fg),0.02)] border border-[rgba(var(--fg),0.1)] group">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-[rgba(var(--fg),0.6)] mb-4">Bulk Add Hero Sections</h4>
            <ImageUploader
              label="Select or Drag multiple images here"
              bucket="project-images"
              maxFiles={50}
              value={[]}
              onChange={(urls) => {
                if (urls.length > 0) {
                  urls.forEach(url => appendSection({ title: "New Section", images: [url] }));
                }
              }}
            />
            <p className="text-[10px] text-[rgba(var(--fg),0.4)] mt-4">
              Tip: Uploading multiple images here will automatically create a new hero section for each image below.
            </p>
          </div>

          <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar" data-lenis-prevent>
            {sectionFields.map((field, index) => (
              <div key={field.id} className="p-6 bg-[rgba(var(--fg),0.05)] border border-[rgba(var(--fg),0.1)] relative group transition-all hover:shadow-sm">
                <button
                  type="button"
                  onClick={() => removeSection(index)}
                  className="absolute top-4 right-4 text-[rgba(var(--fg),0.4)] hover:text-red-500 transition-colors"
                  title="Remove section"
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
            {sectionFields.length === 0 && <p className="text-xs text-[rgba(var(--fg),0.5)] italic">No hero sections added.</p>}
          </div>
        </div>

        {/* --- TAB 3: SPACES --- */}
        <div className={activeTab === "spaces" ? "block animate-in fade-in" : "hidden"}>
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-sm font-bold uppercase tracking-widest">Process Spaces</h3>
            <button
              type="button"
              onClick={() => appendSpace({ name: "New Space", mainImage: "", slider2d: "", slider3d: "" })}
              className="flex items-center gap-2 text-[10px] bg-[rgba(var(--bg),1)] text-[rgba(var(--fg),1)] hover:bg-[#8a9a5b] hover:text-[#1c1c1c] px-4 py-3 uppercase tracking-widest transition-colors"
            >
              <Plus size={14} /> Add Space
            </button>
          </div>

          <div className="mb-8 p-6 bg-[rgba(var(--fg),0.02)] border border-[rgba(var(--fg),0.1)] group">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-[rgba(var(--fg),0.6)] mb-4">Bulk Add Spaces</h4>
            <ImageUploader
              label="Select or Drag multiple images here"
              bucket="project-images"
              maxFiles={50}
              value={[]}
              onChange={(urls) => {
                if (urls.length > 0) {
                  urls.forEach(url => appendSpace({ name: "New Space", mainImage: url, slider2d: "", slider3d: "" }));
                }
              }}
            />
            <p className="text-[10px] text-[rgba(var(--fg),0.4)] mt-4">
              Tip: Uploading multiple images here will automatically create a new space for each image below, setting it as the main image.
            </p>
          </div>

          <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar" data-lenis-prevent>
            {spaceFields.map((field, index) => (
              <div key={field.id} className="p-6 bg-[rgba(var(--fg),0.05)] border border-[rgba(var(--fg),0.1)] relative">
                <button
                  type="button"
                  onClick={() => removeSpace(index)}
                  className="absolute top-4 right-4 text-[rgba(var(--fg),0.4)] hover:text-red-500 transition-colors"
                >
                  <Trash2 size={16} />
                </button>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-3">
                    <ArchitecturalInput label="Space Name" register={register} name={`spaces.${index}.name` as const} required />
                  </div>
                  <div className="space-y-2">
                    <Controller
                      control={control}
                      name={`spaces.${index}.mainImage` as const}
                      render={({ field: { onChange, value } }) => (
                        <ImageUploader label="Main Image" bucket="project-images" maxFiles={1} value={value ? [value] : []} onChange={(urls) => onChange(urls[0] || "")} />
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Controller
                      control={control}
                      name={`spaces.${index}.slider2d` as const}
                      render={({ field: { onChange, value } }) => (
                        <ImageUploader label="2D Drawing" bucket="project-images" maxFiles={1} value={value ? [value] : []} onChange={(urls) => onChange(urls[0] || "")} />
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Controller
                      control={control}
                      name={`spaces.${index}.slider3d` as const}
                      render={({ field: { onChange, value } }) => (
                        <ImageUploader label="3D Render" bucket="project-images" maxFiles={1} value={value ? [value] : []} onChange={(urls) => onChange(urls[0] || "")} />
                      )}
                    />
                  </div>
                </div>
              </div>
            ))}
            {spaceFields.length === 0 && <p className="text-xs text-[rgba(var(--fg),0.5)] italic">No spaces added.</p>}
          </div>
        </div>

        {/* --- TAB 4: GALLERY --- */}
        <div className={activeTab === "gallery" ? "block animate-in fade-in" : "hidden"}>
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-sm font-bold uppercase tracking-widest">Gallery</h3>
            <button
              type="button"
              onClick={() => appendGallery({ id: "", size: "normal" })}
              className="flex items-center gap-2 text-[10px] bg-[rgba(var(--bg),1)] text-[rgba(var(--fg),1)] hover:bg-[#8a9a5b] hover:text-[#1c1c1c] px-4 py-3 uppercase tracking-widest transition-colors"
            >
              <Plus size={14} /> Add Image
            </button>
          </div>

          <div className="mb-8 p-6 bg-[rgba(var(--fg),0.02)] border border-[rgba(var(--fg),0.1)] group">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-[rgba(var(--fg),0.6)] mb-4">Bulk Add to Gallery</h4>
            <ImageUploader
              label="Select or Drag multiple images here"
              bucket="project-images"
              maxFiles={50}
              value={[]}
              onChange={(urls) => {
                if (urls.length > 0) {
                  urls.forEach(url => appendGallery({ id: url, size: "normal" }));
                }
              }}
            />
            <p className="text-[10px] text-[rgba(var(--fg),0.4)] mt-4">
              Tip: Uploading multiple images here will automatically create gallery entries for each image below.
            </p>
          </div>

          <div className="max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar" data-lenis-prevent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {galleryFields.map((field, index) => (
                <div key={field.id} className="p-4 bg-[rgba(var(--fg),0.05)] border border-[rgba(var(--fg),0.1)] flex flex-col gap-3 group relative hover:border-black transition-colors">
                  <button
                    type="button"
                    onClick={() => removeGallery(index)}
                    className="absolute top-2 right-2 text-[rgba(var(--fg),0.4)] hover:text-red-500 transition-colors"
                  >
                    <XIcon size={14} />
                  </button>

                  <div className="space-y-2">
                    <Controller
                      control={control}
                      name={`gallery.${index}.id` as const}
                      render={({ field: { onChange, value } }) => (
                        <ImageUploader label="Gallery Image" bucket="project-images" maxFiles={1} value={value ? [value] : []} onChange={(urls) => onChange(urls[0] || "")} />
                      )}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase tracking-[0.15em] text-[rgba(var(--fg),0.5)]">Grid Size</label>
                    <select
                      {...register(`gallery.${index}.size` as const)}
                      className="w-full pb-2 bg-transparent border-b border-[rgba(var(--fg),0.2)] focus:border-[#8a9a5b] outline-none text-xs uppercase cursor-pointer"
                    >
                      <option value="normal">Normal</option>
                      <option value="wide">Wide</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2 mt-2 pt-2">
                    {watch(`gallery.${index}.size` as any) === "wide" ? <LayoutGrid size={14} /> : <ImageIcon size={14} />}
                    <span className="text-[9px] text-[rgba(var(--fg),0.6)] uppercase tracking-widest">
                      {watch(`gallery.${index}.size` as any) === "wide" ? "Wide Span" : "Standard"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            {galleryFields.length === 0 && <p className="text-xs text-[rgba(var(--fg),0.5)] italic">No gallery images added.</p>}
          </div>
        </div>

        <div className="pt-12 border-t border-[rgba(var(--fg),0.1)] flex justify-end mt-8">
          <button
            type="submit"
            disabled={isLoading}
            className="bg-[rgba(var(--bg),1)] text-[rgba(var(--fg),1)] hover:bg-[#8a9a5b] hover:text-[#1c1c1c] transition-all px-10 py-4 uppercase tracking-[0.2em] text-xs font-bold disabled:opacity-50"
          >
            {isLoading ? "Saving..." : "Save Project Changes"}
          </button>
        </div>
      </div>
    </form>
  );
}