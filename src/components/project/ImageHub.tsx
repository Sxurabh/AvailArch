"use client";

import Image from "next/image";
import { getDriveImage } from "@/lib/driveUtils";
import { ProjectSpace, ProjectGalleryItem, normalizeGallery } from "@/lib/data";
import BeforeAfterSlider from "@/components/ui/BeforeAfterSlider";

interface ImageHubProps {
  spaces?: ProjectSpace[];
  finalGallery?: (string | ProjectGalleryItem)[];
}

export default function ImageHub({ spaces, finalGallery }: ImageHubProps) {
  // Normalize gallery data so we always work with objects
  const galleryItems = normalizeGallery(finalGallery);

  if ((!spaces || spaces.length === 0) && galleryItems.length === 0) {
    return null;
  }

  return (
    <div className="mt-32">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        
        {/* --- SECTION TITLE --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-24 border-b border-black/10 pb-8">
          <h2 className="text-4xl md:text-6xl font-thin uppercase tracking-widest text-neutral-900">
            Design Process
          </h2>
          <p className="text-xs font-medium text-neutral-400 uppercase tracking-[0.2em] max-w-xs text-right mt-4 md:mt-0">
            From Blueprint to Reality
          </p>
        </div>

        {/* --- SPACES LOOP --- */}
        <div className="space-y-32">
          {spaces && spaces.map((space, idx) => {
            const mainImg = getDriveImage(space.mainImage);
            const draw2d = getDriveImage(space.slider2d);
            const render3d = getDriveImage(space.slider3d);

            return (
              <section key={idx} className="group">
                {/* Header */}
                <div className="flex items-baseline gap-4 mb-8">
                  <span className="text-sm font-mono text-neutral-400">0{idx + 1}</span>
                  <h3 className="text-2xl md:text-3xl font-light uppercase tracking-widest text-neutral-900">
                    {space.name}
                  </h3>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8 w-full">
                  
                  {/* LEFT: Slider */}
                  <div className="w-full relative aspect-[4/3] md:aspect-[16/10] overflow-hidden bg-gray-100 border border-gray-200">
                    {draw2d && render3d ? (
                      <BeforeAfterSlider 
                        beforeImage={draw2d} 
                        afterImage={render3d} 
                        leftLabel="Drawing (2D)"
                        rightLabel="Render (3D)"
                        className="h-full w-full" 
                      />
                    ) : (
                      <div className="h-full flex items-center justify-center text-neutral-300 text-xs uppercase tracking-widest">
                         Comparison Unavailable
                      </div>
                    )}
                  </div>

                  {/* RIGHT: Main Image */}
                  <div className="w-full relative aspect-[4/3] md:aspect-[16/10] bg-neutral-900 overflow-hidden border border-gray-200">
                    {mainImg ? (
                      <Image
                        src={mainImg}
                        alt={`${space.name} concept`}
                        fill
                        className="object-cover opacity-90 transition-transform duration-1000 ease-out group-hover:scale-105"
                      />
                    ) : (
                      <div className="h-full flex items-center justify-center text-white/20 text-xs uppercase tracking-widest">
                         Image Unavailable
                      </div>
                    )}
                    <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-black">Concept View</span>
                    </div>
                  </div>

                </div>
              </section>
            );
          })}
        </div>

        {/* --- FINAL EXECUTION GALLERY (CUSTOM GRID) --- */}
        {galleryItems.length > 0 && (
          <div className="mt-48">
             <div className="flex flex-col items-center text-center mb-16">
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-4">Project Gallery</span>
                <h2 className="text-4xl md:text-5xl font-light uppercase tracking-widest text-neutral-900">
                  Final Execution
                </h2>
              </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1 auto-rows-[300px] md:auto-rows-[400px]">
              {galleryItems.map((item, idx) => {
                const src = getDriveImage(item.id);
                if(!src) return null;
                
                // --- CUSTOM GRID LOGIC ---
                // If "wide", span 2 columns on Desktop. If "normal", span 1.
                // Mobile always stacks (col-span-1 by default grid behavior unless overridden)
                const spanClass = item.size === 'wide' 
                    ? "md:col-span-2" 
                    : "md:col-span-1";

                return (
                  <div 
                    key={idx} 
                    className={`relative group overflow-hidden bg-gray-100 ${spanClass}`}
                  >
                    <Image
                      src={src}
                      alt={`Execution detail ${idx + 1}`}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}