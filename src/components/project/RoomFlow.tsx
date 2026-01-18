// src/components/project/RoomFlow.tsx
"use client";
import { RoomDesign } from "@/lib/data";
import { getDriveImage } from "@/lib/driveUtils";
import BeforeAfterSlider from "@/components/ui/BeforeAfterSlider";

export default function RoomFlow({ rooms }: { rooms: RoomDesign[] }) {
  if (!rooms || rooms.length === 0) return null;

  return (
    <div className="w-full bg-white py-24 space-y-32">
      {rooms.map((room, idx) => {
        const img2D = getDriveImage(room.drawing2D);
        const img3D = getDriveImage(room.render3D);

        // Skip if images are missing
        if (!img2D || !img3D) return null;

        return (
          <div key={idx} id={`room-${idx}`} className="max-w-7xl mx-auto px-6 md:px-12 scroll-mt-32">
            {/* Section Title */}
            <div className="flex items-center gap-4 mb-12">
               <span className="text-xs font-mono text-gray-300 font-bold">0{idx + 1}</span>
               <h2 className="text-2xl md:text-3xl font-light uppercase tracking-widest text-black">
                 {room.name}
               </h2>
               <div className="h-[1px] flex-grow bg-gray-100 ml-4" />
            </div>

            {/* Comparison Slider */}
            <div className="shadow-2xl shadow-gray-200/50 rounded-sm overflow-hidden border border-gray-100">
               <BeforeAfterSlider 
                 beforeImage={img2D} 
                 afterImage={img3D}
                 leftLabel="2D Layout"
                 rightLabel="3D Render"
               />
            </div>
            
            <p className="mt-6 text-[10px] text-gray-400 uppercase tracking-widest text-center">
              Drag the slider to compare the design evolution
            </p>
          </div>
        );
      })}
    </div>
  );
}