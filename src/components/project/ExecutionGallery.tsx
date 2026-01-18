// src/components/project/ExecutionGallery.tsx
"use client";
import Image from "next/image";
import { getDriveImage } from "@/lib/driveUtils";

export default function ExecutionGallery({ images }: { images: string[] }) {
  if (!images || images.length === 0) return null;

  return (
    <div className="w-full bg-neutral-950 py-32">
      <div className="max-w-7xl mx-auto px-6 md:px-12 mb-16">
        <h2 className="text-3xl md:text-5xl font-light uppercase tracking-widest text-white mb-3">
          Final Execution
        </h2>
        <p className="text-white/40 text-xs uppercase tracking-widest">
          On-site realization & Completed Details
        </p>
      </div>

      <div className="flex flex-col gap-4 md:gap-8">
        {images.map((imgId, idx) => {
           const src = getDriveImage(imgId);
           if (!src) return null;

           return (
             <div key={idx} className="relative w-full h-[60vh] md:h-[90vh] bg-neutral-900 group">
               <Image 
                 src={src} 
                 alt={`Execution shot ${idx + 1}`}
                 fill
                 className="object-cover transition-opacity duration-500 hover:opacity-90"
               />
               {/* Optional gradient overlay for depth */}
               <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20 pointer-events-none" />
             </div>
           );
        })}
      </div>
    </div>
  );
}