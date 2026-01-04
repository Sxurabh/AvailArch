export interface Project {
  id: string;
  title: string;
  year: string;
  category: string;
  image: string; // Main display image
  // New Fields
  description?: string;
  client?: string;
  location?: string;
  beforeImage?: string; // URL for "Before" state
  afterImage?: string;  // URL for "After" state
}

// Keep the array empty as we rely on Sheets
export const projects: Project[] = [];