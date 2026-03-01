"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updateCursor = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      setIsVisible(true);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "A" || target.tagName === "BUTTON" || target.closest("a") || target.closest("button")) {
        setIsHovered(true);
      } else {
        setIsHovered(false);
      }
    };

    window.addEventListener("mousemove", updateCursor);
    window.addEventListener("mouseover", handleMouseOver);

    return () => {
      window.removeEventListener("mousemove", updateCursor);
      window.removeEventListener("mouseover", handleMouseOver);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <motion.div
      className="fixed top-0 left-0 w-8 h-8 border border-black rounded-full pointer-events-none z-[9999] mix-blend-difference"
      animate={{
        x: position.x - 5,
        y: position.y - 5,
        scale: isHovered ? 2 : 1,
        backgroundColor: isHovered ? "white" : "transparent",
        borderColor: isHovered ? "transparent" : "white",
      }}
      transition={{
        type: "spring",
        stiffness: 100,
        damping: 10,
        mass: 0.1
      }}
    >
      {/* Optional: Add text inside cursor on hover */}
      {isHovered && (
        <span className="flex items-center justify-center w-full h-full text-[4px] font-bold text-[#1c1c1c] uppercase tracking-widest">
          
        </span>
      )}
    </motion.div>
  );
}