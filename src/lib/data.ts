// src/lib/data.ts

export interface ProjectSpace {
  name: string;
  mainImage: string;
  slider2d: string;
  slider3d: string;
}

export interface ProjectSection {
  title: string;
  images: string[];
}

export interface ProjectGalleryItem {
  id: string;
  size?: "normal" | "wide";
}

export interface Project {
  id: string;
  title: string;
  year: string;
  category: string;
  image: string;

  // 🟢 NEW: Controls homepage grid layout (freeform)
  gridColSpan?: number;
  gridRowSpan?: number;

  // Complex Dynamic Fields
  heroImages?: string[];
  sections?: ProjectSection[];
  spaces?: ProjectSpace[];

  // Gallery can now be simple strings OR objects with layout info
  gallery?: (string | ProjectGalleryItem)[];

  description?: string;
  client?: string;
  location?: string;
  beforeImage?: string;
  afterImage?: string;
}

// Helper to safely parse gallery items whether they are strings or objects
export const normalizeGallery = (gallery?: (string | ProjectGalleryItem)[]): ProjectGalleryItem[] => {
  if (!gallery) return [];
  return gallery.map(item => {
    if (typeof item === 'string') return { id: item, size: 'normal' };
    return item;
  });
};
