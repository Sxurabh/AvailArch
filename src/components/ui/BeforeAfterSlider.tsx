// src/components/ui/BeforeAfterSlider.tsx
"use client";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
  leftLabel?: string;  // Custom label for left image (default: Before)
  rightLabel?: string; // Custom label for right image (default: After)
}

export default function BeforeAfterSlider({ 
  beforeImage, 
  afterImage, 
  leftLabel = "Before", 
  rightLabel = "After" 
}: BeforeAfterSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (event: React.MouseEvent | React.TouchEvent) => {
    if (!containerRef.current) return;
    const { left, width } = containerRef.current.getBoundingClientRect();
    const clientX = 'touches' in event ? event.touches[0].clientX : (event as React.MouseEvent).clientX;
    const position = ((clientX - left) / width) * 100;
    setSliderPosition(Math.min(100, Math.max(0, position)));
  };

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMove as any);
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("touchmove", handleMove as any);
      window.addEventListener("touchend", handleMouseUp);
    } else {
      window.removeEventListener("mousemove", handleMove as any);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleMove as any);
      window.removeEventListener("touchend", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMove as any);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-[500px] overflow-hidden cursor-ew-resize select-none bg-gray-100 group border border-gray-200"
      onMouseDown={handleMouseDown}
      onTouchStart={handleMouseDown}
    >
      {/* RIGHT Image (Background - Usually 3D/After) */}
      <Image src={afterImage} alt={rightLabel} fill className="object-cover" />
      <div className="absolute top-4 right-4 bg-black/60 text-white text-[10px] uppercase tracking-widest px-3 py-1 backdrop-blur-md z-10 font-medium rounded-sm">
        {rightLabel}
      </div>

      {/* LEFT Image (Clipped - Usually 2D/Before) */}
      <div className="absolute inset-0 overflow-hidden" style={{ width: `${sliderPosition}%` }}>
        <Image src={beforeImage} alt={leftLabel} fill className="object-cover" />
        <div className="absolute top-4 left-4 bg-black/60 text-white text-[10px] uppercase tracking-widest px-3 py-1 backdrop-blur-md z-10 font-medium rounded-sm">
           {leftLabel}
        </div>
      </div>

      {/* Vertical Slider Handle */}
      <div 
        className="absolute inset-y-0 w-1 bg-white cursor-ew-resize shadow-[0_0_15px_rgba(0,0,0,0.5)] z-20 flex items-center justify-center"
        style={{ left: `${sliderPosition}%` }}
      >
        <div className="w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center border border-gray-200 transform hover:scale-110 transition-transform">
            <svg className="w-4 h-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l-3 3 3 3m8-6l3 3-3 3" />
            </svg>
        </div>
      </div>
    </div>
  );
}