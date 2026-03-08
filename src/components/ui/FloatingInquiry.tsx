"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useUser } from "@/hooks/useUser";
import MagneticButton from "./MagneticButton";

export default function FloatingInquiry() {
  const { user } = useUser();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 500) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  // 3. Early return if user is admin
  if (user && user.role === "admin") {
    return null;
  }


  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-8 right-8 z-40 hidden md:block"
        >
          <MagneticButton>
            <Link
              href="/track-request"
              className="flex items-center gap-2 bg-[#1c1c1c] text-white px-6 py-4 rounded-full shadow-2xl hover:bg-gray-900 transition-colors group"
            >
              <span className="text-[10px] uppercase font-bold tracking-[0.2em]">
                Start Project
              </span>
              <ArrowUpRight size={14} className="group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </MagneticButton>
        </motion.div>
      )}
    </AnimatePresence>
  );
}