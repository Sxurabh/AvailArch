export interface ProjectSpace {
  name: string;      // e.g., "Dining Hall"
  mainImage: string; // The "box" image
  slider2d: string;  // Left slider image (2D)
  slider3d: string;  // Right slider image (3D Render)
  finalImages: string[]; // Grid at the bottom
}

export interface Project {
  id: string;
  title: string;
  year: string;
  category: string;
  image: string; // Fallback Main display image
  
  // New Fields for Enhanced Layout
  heroImages?: string[]; // List of images for the top carousel
  spaces?: ProjectSpace[]; // List of spaces (Dining, Living, etc.)

  // Existing Fields
  description?: string;
  client?: string;
  location?: string;
  beforeImage?: string; 
  afterImage?: string;  
}

// Keep the array empty as we rely on Sheets
export const projects: Project[] = [];