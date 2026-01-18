export interface ProjectSpace {
  name: string;      // e.g., "Dining Hall"
  mainImage: string; // The "box" image ID
  slider2d: string;  // Left slider image (2D) ID
  slider3d: string;  // Right slider image (3D Render) ID
}

export interface ProjectSection {
  title: string;
  images: string[]; // Array of Image IDs
}

export interface ProjectGalleryItem {
  id: string;       // Image ID
  size?: "normal" | "wide"; // Desktop layout control
}

export interface Project {
  id: string;
  title: string;
  year: string;
  category: string;
  image: string; // Main thumbnail
  
  // Complex Dynamic Fields
  heroImages?: string[]; // Fallback
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

export const projects: Project[] = [];