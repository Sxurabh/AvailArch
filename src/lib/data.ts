export interface Project {
  id: string;
  title: string;
  year: string;
  category: string;
  image: string; // URL or local path
}

export const projects: Project[] = [
  {
    id: "1",
    title: "The Eos Studio",
    year: "2025",
    category: "Architecture",
    image: "https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&w=2700&auto=format&fit=crop",
  },
  {
    id: "2",
    title: "Pier 76 Urban Potential Mapping Atlas",
    year: "2025",
    category: "Urban Design",
    image: "https://images.unsplash.com/photo-1486744360530-ca984f8d0520?q=80&w=2700&auto=format&fit=crop",
  },
  {
    id: "3",
    title: "REPAIR OF THE DESERTED ISLAND",
    year: "2025",
    category: "Landscape",
    image: "https://images.unsplash.com/photo-1506459225024-1428097a7e18?q=80&w=2700&auto=format&fit=crop",
  },
  {
    id: "4",
    title: "Kaurna Culture Kindergarten",
    year: "2024",
    category: "Architecture",
    image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=2700&auto=format&fit=crop",
  },
  {
    id: "5",
    title: "THE HOME OF SHADOWS",
    year: "2024",
    category: "Interior",
    image: "https://images.unsplash.com/photo-1518005052357-e9847508d4e4?q=80&w=2700&auto=format&fit=crop",
  },
  {
    id: "6",
    title: "UNDER THE SAME CEILING",
    year: "2023",
    category: "Installation",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2700&auto=format&fit=crop",
  },
  {
    id: "7",
    title: "Traversing the Chinese Artistry",
    year: "2023",
    category: "Research",
    image: "https://images.unsplash.com/photo-1523726491678-bf852e717f6a?q=80&w=2700&auto=format&fit=crop",
  },
];