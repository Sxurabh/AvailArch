"use client";

import { useState } from "react";
import Image from "next/image";
import { Project, ProjectSection } from "@/lib/data";
import { getDriveImage } from "@/lib/driveUtils";
import { ChevronLeft, ChevronRight, X, ArrowUpRight } from "lucide-react";

interface ProjectHeroProps {
  project: Project;
  mainImageSrc: string | null;
}

export default function ProjectHero({ project, mainImageSrc }: ProjectHeroProps) {
  const [activeSection, setActiveSection] = useState<number | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Pagination for Space Cards
  const [sectionStartIndex, setSectionStartIndex] = useState(0);
  const VISIBLE_SECTIONS_COUNT = 3;

  // --- HANDLERS ---
  const handleSectionClick = (index: number) => {
    setActiveSection(index);
    setCurrentImageIndex(0);
  };

  const handleClose = () => {
    setActiveSection(null);
    setCurrentImageIndex(0);
  };

  // Main Image Carousel Nav
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

  // Space List Nav
  const handleNextSectionList = () => {
    if (!project.sections) return;
    setSectionStartIndex((prev) => 
      Math.min(prev + 1, project.sections!.length - VISIBLE_SECTIONS_COUNT)
    );
  };

  const handlePrevSectionList = () => {
    setSectionStartIndex((prev) => Math.max(prev - 1, 0));
  };

  // --- RENDER LOGIC ---
  const isCarouselMode = activeSection !== null;
  const currentSection = isCarouselMode && project.sections ? project.sections[activeSection] : null;
  
  const activeImageSrc = isCarouselMode && currentSection
    ? getDriveImage(currentSection.images[currentImageIndex])
    : mainImageSrc;

  const allSections = project.sections || [];
  const visibleSections = allSections.slice(
    sectionStartIndex, 
    sectionStartIndex + VISIBLE_SECTIONS_COUNT
  );

  return (
    <div className="relative w-full h-[85vh] bg-neutral-900 overflow-hidden group">
      
      {/* BACKGROUND IMAGE */}
      <div className="absolute inset-0 transition-opacity duration-700 ease-in-out">
        {activeImageSrc ? (
          <Image
            key={activeImageSrc}
            src={activeImageSrc}
            alt={project.title}
            fill
            className="object-cover opacity-80"
            priority
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90" />
      </div>

      {/* --- HERO CONTENT (Title + Cards) --- */}
      <div 
        className={`absolute inset-0 p-6 md:p-12 flex flex-col justify-end transition-all duration-500 transform ${
          isCarouselMode ? "opacity-0 translate-y-8 pointer-events-none" : "opacity-100 translate-y-0"
        }`}
      >
        <div className="max-w-7xl w-full mx-auto relative z-10">
          <h1 className="text-white text-5xl md:text-8xl font-thin uppercase tracking-widest mb-8 drop-shadow-lg">
            {project.title}
          </h1>
          
          <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8 border-t border-white/20 pt-8">
            <div className="flex gap-4 text-white/80 text-xs md:text-sm uppercase tracking-[0.2em] font-medium">
              <span>{project.category}</span>
              <span className="text-white/40">•</span>
              <span>{project.year}</span>
            </div>

            {/* SPACE CARDS CAROUSEL */}
            {allSections.length > 0 && (
              <div className="flex items-center gap-4">
                
                {/* Prev Arrow */}
                <button 
                  onClick={handlePrevSectionList}
                  disabled={sectionStartIndex === 0}
                  className="p-2 rounded-full border border-white/10 hover:bg-white/10 text-white disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="flex gap-4 overflow-hidden">
                  {visibleSections.map((section, idx) => {
                    const originalIndex = sectionStartIndex + idx;
                    return (
                      <button
                        key={originalIndex}
                        onClick={() => handleSectionClick(originalIndex)}
                        className="group/card relative flex items-center gap-4 bg-white/5 hover:bg-white backdrop-blur-md border border-white/10 hover:border-white px-5 py-4 transition-all duration-300 min-w-[180px] text-left"
                      >
                        <div className="flex flex-col">
                          <span className="text-[9px] text-white/50 group-hover/card:text-[#1c1c1c]/50 uppercase tracking-widest mb-1">
                            Explore
                          </span>
                          <span className="text-sm text-white group-hover/card:text-[#1c1c1c] uppercase tracking-widest font-semibold">
                            {section.title}
                          </span>
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-white group-hover/card:text-[#1c1c1c] ml-auto opacity-50 group-hover/card:opacity-100" />
                      </button>
                    );
                  })}
                </div>

                {/* Next Arrow */}
                <button 
                  onClick={handleNextSectionList}
                  disabled={sectionStartIndex >= allSections.length - VISIBLE_SECTIONS_COUNT}
                  className="p-2 rounded-full border border-white/10 hover:bg-white/10 text-white disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- CAROUSEL OVERLAY (When a Space is clicked) --- */}
      <div 
        className={`absolute inset-0 z-30 flex flex-col justify-between transition-opacity duration-500 ${
          !isCarouselMode ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        {/* Top Header */}
        <div className="w-full p-8 flex justify-between items-start bg-gradient-to-b from-black/80 to-transparent">
          <div>
            <span className="block text-[10px] text-white/60 uppercase tracking-widest mb-1">Viewing Space</span>
            <h2 className="text-3xl text-white font-light uppercase tracking-widest">
              {currentSection?.title}
            </h2>
          </div>
          
          <button 
            onClick={handleClose}
            className="p-3 border border-white/20 rounded-full hover:bg-white hover:text-[#1c1c1c] text-white transition-all duration-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Center Arrows */}
        <div className="absolute inset-0 flex items-center justify-between px-4 md:px-12 pointer-events-none">
          <button 
            onClick={prevImage}
            className="pointer-events-auto p-4 text-white/50 hover:text-white hover:bg-[#1c1c1c]/30 rounded-full backdrop-blur-sm transition-all"
          >
            <ChevronLeft className="w-12 h-12 font-thin" strokeWidth={0.5} />
          </button>

          <button 
            onClick={nextImage}
            className="pointer-events-auto p-4 text-white/50 hover:text-white hover:bg-[#1c1c1c]/30 rounded-full backdrop-blur-sm transition-all"
          >
            <ChevronRight className="w-12 h-12 font-thin" strokeWidth={0.5} />
          </button>
        </div>

        {/* Bottom Counter */}
        <div className="w-full p-8 flex justify-center bg-gradient-to-t from-black/80 to-transparent">
           <div className="bg-[#1c1c1c]/40 backdrop-blur-md px-6 py-2 rounded-full border border-white/10">
            <span className="text-xs text-white uppercase tracking-widest font-mono">
              Image {currentImageIndex + 1} of {currentSection?.images.length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}