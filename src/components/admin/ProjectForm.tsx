// src/components/admin/ProjectForm.tsx
"use client";

import { useState, useEffect } from "react";

// Structure for a single comparison slide
interface ComparisonSlide {
  before: string;
  after: string;
}

interface ProjectFormProps {
  existingProject?: any;
  onSuccess?: () => void;
  onCancel: () => void;
}

export default function ProjectForm({
  existingProject,
  onSuccess,
  onCancel,
}: ProjectFormProps) {
  const [loading, setLoading] = useState(false);

  // Core Data
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Interior Design",
    year: new Date().getFullYear().toString(),
    // We will still keep a 'main' image for thumbnails
    imageUrl: "", 
  });

  // Dynamic Array for Slides
  const [slides, setSlides] = useState<ComparisonSlide[]>([
    { before: "", after: "" },
  ]);

  useEffect(() => {
    if (existingProject) {
      setFormData({
        title: existingProject.title || "",
        description: existingProject.description || "",
        category: existingProject.category || "Interior Design",
        year: existingProject.year || new Date().getFullYear().toString(),
        imageUrl: existingProject.imageUrl || "",
      });

      // Parse existing slides if available, otherwise fallback
      if (existingProject.comparisons) {
        try {
          const parsed = JSON.parse(existingProject.comparisons);
          setSlides(parsed);
        } catch (e) {
          setSlides([{ before: "", after: "" }]);
        }
      } else if (existingProject.imageUrl && existingProject.beforeImageUrl) {
        // Migration support for the previous single-image version
        setSlides([
          {
            before: existingProject.beforeImageUrl,
            after: existingProject.imageUrl,
          },
        ]);
      }
    }
  }, [existingProject]);

  const addSlide = () => {
    setSlides([...slides, { before: "", after: "" }]);
  };

  const removeSlide = (index: number) => {
    const newSlides = [...slides];
    newSlides.splice(index, 1);
    setSlides(newSlides);
  };

  const updateSlide = (index: number, field: "before" | "after", val: string) => {
    const newSlides = [...slides];
    newSlides[index][field] = val;
    setSlides(newSlides);
    
    // Auto-set the main thumbnail to the first 'after' image if empty
    if (index === 0 && field === 'after' && !formData.imageUrl) {
        setFormData(prev => ({ ...prev, imageUrl: val }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Prepare payload
    const payload = {
      ...formData,
      // Serialize slides to store in Google Sheets
      comparisons: JSON.stringify(slides), 
    };

    try {
      const method = existingProject ? "PUT" : "POST";
      const url = existingProject
        ? `/api/projects/${existingProject._id}`
        : "/api/projects";

      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setLoading(false);
    }
  };

  // Minimal Input Styles
  const labelStyle = "block text-[10px] uppercase tracking-widest text-gray-400 mb-2";
  const inputStyle = "w-full border-b border-gray-200 py-2 text-sm bg-transparent focus:outline-none focus:border-black rounded-none placeholder:text-gray-300 transition-colors";

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl animate-fade-in-up">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
        {/* Left Col: Details */}
        <div className="space-y-8">
          <h3 className="text-xs font-bold uppercase tracking-widest border-b border-gray-100 pb-2 mb-6 text-black">
            01. Project Data
          </h3>

          <div>
            <label className={labelStyle}>Project Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="e.g. RESIDENCE 9"
              className={inputStyle}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div>
              <label className={labelStyle}>Type</label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className={inputStyle}
              >
                <option>Interior Design</option>
                <option>Architecture</option>
                <option>Commercial</option>
                <option>Renovation</option>
              </select>
            </div>
            <div>
              <label className={labelStyle}>Year</label>
              <input
                type="text"
                value={formData.year}
                onChange={(e) =>
                  setFormData({ ...formData, year: e.target.value })
                }
                className={inputStyle}
              />
            </div>
          </div>

          <div>
            <label className={labelStyle}>Main Thumbnail URL</label>
            <input
              type="url"
              value={formData.imageUrl}
              onChange={(e) =>
                setFormData({ ...formData, imageUrl: e.target.value })
              }
              placeholder="https://..."
              className={inputStyle}
              required
            />
          </div>

          <div>
            <label className={labelStyle}>Brief</label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={4}
              className="w-full border border-gray-200 p-4 text-sm focus:outline-none focus:border-black transition-colors resize-none mt-2"
              placeholder="Project description..."
            />
          </div>
        </div>

        {/* Right Col: Gallery Manager */}
        <div className="space-y-8">
          <div className="flex justify-between items-end border-b border-gray-100 pb-2 mb-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-black">
              02. Comparison Gallery
            </h3>
            <button
              type="button"
              onClick={addSlide}
              className="text-[9px] uppercase tracking-widest font-bold text-black hover:opacity-50"
            >
              + Add Pair
            </button>
          </div>

          <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin">
            {slides.map((slide, idx) => (
              <div
                key={idx}
                className="bg-gray-50/50 p-4 border border-gray-100 group hover:border-gray-200 transition-colors"
              >
                <div className="flex justify-between mb-3">
                  <span className="text-[9px] uppercase tracking-widest text-gray-400">
                    Slide {idx + 1}
                  </span>
                  {slides.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSlide(idx)}
                      className="text-[9px] uppercase text-red-400 hover:text-red-600"
                    >
                      Remove
                    </button>
                  )}
                </div>
                
                <div className="space-y-3">
                    <input
                        type="url"
                        placeholder="Before Image URL"
                        value={slide.before}
                        onChange={(e) => updateSlide(idx, 'before', e.target.value)}
                        className="w-full bg-white border-b border-gray-200 px-2 py-1.5 text-xs focus:outline-none focus:border-black placeholder:text-gray-300"
                    />
                     <input
                        type="url"
                        placeholder="After Image URL (Required)"
                        value={slide.after}
                        onChange={(e) => updateSlide(idx, 'after', e.target.value)}
                        className="w-full bg-white border-b border-gray-200 px-2 py-1.5 text-xs focus:outline-none focus:border-black placeholder:text-gray-300"
                    />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="pt-6 border-t border-gray-100 flex justify-end gap-6">
        <button
            type="button"
            onClick={onCancel}
            className="text-[10px] uppercase tracking-[0.2em] text-gray-400 hover:text-black transition-colors"
        >
            Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="bg-black text-white px-10 py-3 text-[10px] uppercase tracking-[0.2em] hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          {loading ? "Saving..." : existingProject ? "Update Project" : "Publish Project"}
        </button>
      </div>
    </form>
  );
}