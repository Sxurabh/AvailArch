"use client";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
}

export default function BeforeAfterSlider({ beforeImage, afterImage }: BeforeAfterSliderProps) {
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
      // Clean up touch events too
    };
  }, [isDragging]);

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-[500px] overflow-hidden cursor-ew-resize select-none bg-gray-100 group"
      onMouseDown={handleMouseDown}
      onTouchStart={handleMouseDown}
    >
      {/* AFTER Image (Background) */}
      <Image src={afterImage} alt="After" fill className="object-cover" />
      
      {/* Label: After */}
      <div className="absolute top-4 right-4 bg-black/50 text-white text-[10px] uppercase tracking-widest px-3 py-1 backdrop-blur-md z-10">
        After
      </div>

      {/* BEFORE Image (Clipped on top) */}
      <div 
        className="absolute inset-0 overflow-hidden" 
        style={{ width: `${sliderPosition}%` }}
      >
        <Image src={beforeImage} alt="Before" fill className="object-cover" />
        
        {/* Label: Before */}
        <div className="absolute top-4 left-4 bg-black/50 text-white text-[10px] uppercase tracking-widest px-3 py-1 backdrop-blur-md z-10">
           Before
        </div>
      </div>

      {/* Slider Handle Line */}
      <div 
        className="absolute inset-y-0 w-1 bg-white cursor-ew-resize shadow-[0_0_10px_rgba(0,0,0,0.5)] z-20 flex items-center justify-center"
        style={{ left: `${sliderPosition}%` }}
      >
        <div className="w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l-3 3 3 3m8-6l3 3-3 3" />
            </svg>
        </div>
      </div>
    </div>
  );
}