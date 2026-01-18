"use client";

import Image from "next/image";
import { getDriveImage } from "@/lib/driveUtils";

export default function ImageHub({ images }: { images: string[] }) {
  if (!images || images.length === 0) return null;

  return (
    <div className="mt-24 border-t border-black/10 pt-24">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <h2 className="text-3xl md:text-4xl font-light uppercase tracking-widest">
            Image Hub
          </h2>
          <p className="text-xs text-gray-400 uppercase tracking-widest max-w-xs leading-relaxed">
            A curated collection of details, angles, and perspectives from this project.
          </p>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {images.map((imgId, idx) => {
            const src = getDriveImage(imgId);
            if(!src) return null;
            
            return (
              <div 
                key={idx} 
                className={`relative group overflow-hidden bg-gray-100 ${
                  // Span 2 columns for every 3rd image for visual interest
                  idx % 3 === 0 ? "md:col-span-2 aspect-[16/9]" : "aspect-[4/5]"
                }`}
              >
                <Image
                  src={src}
                  alt={`Gallery image ${idx + 1}`}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105 filter grayscale hover:grayscale-0"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}