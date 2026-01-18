"use client";

import { useState } from "react";
import Image from "next/image";
import { Project, ProjectSection } from "@/lib/data";
import { getDriveImage } from "@/lib/driveUtils";
import { ChevronLeft, ChevronRight, X, ArrowUpRight } from "lucide-react"; // Ensure lucide-react is installed

interface ProjectHeroProps {
  project: Project;
  mainImageSrc: string | null;
}

export default function ProjectHero({ project, mainImageSrc }: ProjectHeroProps) {
  const [activeSection, setActiveSection] = useState<number | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Handle opening a section
  const handleSectionClick = (index: number) => {
    setActiveSection(index);
    setCurrentImageIndex(0);
  };

  // Handle closing the carousel
  const handleClose = () => {
    setActiveSection(null);
    setCurrentImageIndex(0);
  };

  // Carousel Navigation
  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeSection === null || !project.sections) return;
    const section = project.sections[activeSection];
    setCurrentImageIndex((prev) => (prev + 1) % section.images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeSection === null || !project.sections) return;
    const section = project.sections[activeSection];
    setCurrentImageIndex((prev) => 
      prev === 0 ? section.images.length - 1 : prev - 1
    );
  };

  // Determine what image to show
  const isCarouselMode = activeSection !== null;
  const currentSection = isCarouselMode && project.sections ? project.sections[activeSection] : null;
  
  // Resolve image URL safely
  const activeImageSrc = isCarouselMode && currentSection
    ? getDriveImage(currentSection.images[currentImageIndex])
    : mainImageSrc;

  return (
    <div className="relative w-full h-[85vh] bg-neutral-900 overflow-hidden group">
      
      {/* BACKGROUND IMAGE (Animated Transition) */}
      <div className="absolute inset-0 transition-opacity duration-700 ease-in-out">
        {activeImageSrc ? (
          <Image
            key={activeImageSrc} // Key change forces animation
            src={activeImageSrc}
            alt={project.title}
            fill
            className="object-cover opacity-90"
            priority
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/20 uppercase tracking-widest font-mono">
            Image Unavailable
          </div>
        )}
        <div className="absolute inset-0 bg-black/30 transition-colors duration-500" />
      </div>

      {/* --- HERO MODE CONTENT --- */}
      <div 
        className={`absolute inset-0 p-6 md:p-12 flex flex-col justify-end transition-all duration-500 ${
          isCarouselMode ? "opacity-0 pointer-events-none translate-y-10" : "opacity-100 translate-y-0"
        }`}
      >
        <div className="max-w-7xl w-full mx-auto relative z-10">
          <h1 className="text-white text-5xl md:text-8xl font-light uppercase tracking-widest mb-6">
            {project.title}
          </h1>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-t border-white/20 pt-8">
            <div className="flex gap-4 text-white/80 text-xs md:text-sm uppercase tracking-[0.2em]">
              <span>{project.category}</span>
              <span>•</span>
              <span>{project.year}</span>
            </div>

            {/* SECTION CARDS (The "Clickable Cards") */}
            {project.sections && project.sections.length > 0 && (
              <div className="flex flex-wrap gap-4">
                {project.sections.map((section, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSectionClick(idx)}
                    className="group/card flex items-center gap-3 bg-white/10 hover:bg-white backdrop-blur-md border border-white/20 px-6 py-4 transition-all duration-300 min-w-[160px]"
                  >
                    <div className="flex flex-col items-start">
                      <span className="text-[10px] text-white/60 group-hover/card:text-black/60 uppercase tracking-widest mb-1">
                        View Space
                      </span>
                      <span className="text-sm text-white group-hover/card:text-black uppercase tracking-widest font-medium">
                        {section.title}
                      </span>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-white group-hover/card:text-black ml-auto opacity-50 group-hover/card:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- CAROUSEL MODE CONTROLS --- */}
      <div 
        className={`absolute inset-0 transition-opacity duration-500 ${
          !isCarouselMode ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        {/* Top Bar */}
        <div className="absolute top-0 left-0 w-full p-8 flex justify-between items-start z-20 bg-gradient-to-b from-black/60 to-transparent">
          <div>
            <span className="block text-[10px] text-white/60 uppercase tracking-widest mb-1">Viewing Section</span>
            <h2 className="text-2xl text-white font-light uppercase tracking-widest">
              {currentSection?.title}
            </h2>
          </div>
          
          <button 
            onClick={handleClose}
            className="p-2 border border-white/20 rounded-full hover:bg-white hover:text-black text-white transition-all duration-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation Arrows (Transparent / Minimal) */}
        <button 
          onClick={prevImage}
          className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 p-4 text-white/50 hover:text-white hover:bg-black/20 rounded-full transition-all duration-300"
        >
          <ChevronLeft className="w-10 h-10 md:w-16 md:h-16 font-thin" strokeWidth={1} />
        </button>

        <button 
          onClick={nextImage}
          className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 p-4 text-white/50 hover:text-white hover:bg-black/20 rounded-full transition-all duration-300"
        >
          <ChevronRight className="w-10 h-10 md:w-16 md:h-16 font-thin" strokeWidth={1} />
        </button>

        {/* Counter */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
          <span className="text-xs text-white uppercase tracking-widest font-mono">
            {currentImageIndex + 1} / {currentSection?.images.length}
          </span>
        </div>
      </div>
    </div>
  );
}