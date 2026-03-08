// src/components/ui/Toast.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Info } from "lucide-react";

export type ToastType = "success" | "error" | "info";

interface ToastProps {
  message: string;
  type?: ToastType;
  isVisible: boolean;
  onClose: () => void;
}

export default function Toast({ message, type = "success", isVisible, onClose }: ToastProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-8 right-8 z-50 flex items-center gap-3 px-6 py-4 bg-[#111] text-white shadow-2xl min-w-[300px]"
        >
          {/* Accent Line */}
          <div 
            className={`absolute left-0 top-0 bottom-0 w-1 ${
              type === "success" ? "bg-[#8a9a5b]" : type === "error" ? "bg-red-500" : "bg-blue-500"
            }`} 
          />

          <div className="flex-shrink-0">
            {type === "success" && <Check size={16} className="text-[#8a9a5b]" />}
            {type === "error" && <X size={16} className="text-red-500" />}
            {type === "info" && <Info size={16} className="text-blue-500" />}
          </div>

          <div className="flex-1 mr-4">
            <p className="text-xs uppercase tracking-widest font-medium">
              {type}
            </p>
            <p className="text-xs text-gray-400 mt-1 font-mono">
              {message}
            </p>
          </div>
          
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X size={14} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}