"use client";

import Image from "next/image";
import { getDriveImage } from "@/lib/driveUtils";
import { useState, useEffect, useCallback, useRef } from "react";
import { X, ChevronLeft, ChevronRight, Maximize2, Minimize2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { ProjectSpace, ProjectGalleryItem, normalizeGallery } from "@/lib/data";
import BeforeAfterSlider from "@/components/ui/BeforeAfterSlider";

interface ImageHubProps {
  spaces?: ProjectSpace[];
  finalGallery?: (string | ProjectGalleryItem)[];
}

// Direction-aware slide variants: "next" slides left, "prev" slides right
const slideVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? "60%" : "-60%",
    opacity: 0,
    scale: 0.94,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (dir: number) => ({
    x: dir > 0 ? "-60%" : "60%",
    opacity: 0,
    scale: 0.94,
  }),
};

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export default function ImageHub({ spaces, finalGallery }: ImageHubProps) {

  // Normalize gallery data so we always work with objects
  const galleryItems = normalizeGallery(finalGallery);

  // Modal state
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Track direction: +1 = forward (next), -1 = backward (prev)
  const direction = useRef<number>(1);

  const openModal = (index: number) => {
    direction.current = 1;
    setSelectedImageIndex(index);
    setIsFullScreen(false);
  };

  const closeModal = useCallback(() => {
    setSelectedImageIndex(null);
    setIsFullScreen(false);
  }, []);

  const nextImage = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    direction.current = 1;
    setSelectedImageIndex((prev) =>
      prev === null ? 0 : (prev + 1) % galleryItems.length
    );
  }, [galleryItems.length]);

  const prevImage = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    direction.current = -1;
    setSelectedImageIndex((prev) =>
      prev === null ? 0 : prev === 0 ? galleryItems.length - 1 : prev - 1
    );
  }, [galleryItems.length]);

  const toggleFullScreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFullScreen((prev) => !prev);
  };

  // Keyboard navigation
  useEffect(() => {
    if (selectedImageIndex === null) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") nextImage();
      if (e.key === "ArrowLeft") prevImage();
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [selectedImageIndex, nextImage, prevImage, closeModal]);

  // Lock body scroll when modal is open — never hide the cursor
  useEffect(() => {
    if (selectedImageIndex !== null) {
      document.body.style.overflow = "hidden";
      // Ensure cursor is always visible
      document.documentElement.style.cursor = "default";
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.cursor = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.cursor = "";
    };
  }, [selectedImageIndex]);

  const activeItem = selectedImageIndex !== null ? galleryItems[selectedImageIndex] : null;
  const activeSrc = activeItem ? getDriveImage(activeItem.id) : null;

  // Pre-resolve neighbour URLs for prefetch hints
  const prevSrc = selectedImageIndex !== null
    ? getDriveImage(galleryItems[(selectedImageIndex - 1 + galleryItems.length) % galleryItems.length]?.id)
    : null;
  const nextSrc = selectedImageIndex !== null
    ? getDriveImage(galleryItems[(selectedImageIndex + 1) % galleryItems.length]?.id)
    : null;

  if ((!spaces || spaces.length === 0) && galleryItems.length === 0) {
    return null;
  }

  return (
    <div className="mt-32">
      <div className="max-w-[1600px] mx-auto px-6 md:px-12">

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
                <div className="flex items-baseline gap-4 mb-8">
                  <span className="text-sm font-mono text-neutral-400">0{idx + 1}</span>
                  <h3 className="text-2xl md:text-3xl font-light uppercase tracking-widest text-neutral-900">
                    {space.name}
                  </h3>
                </div>

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
                        quality={85}
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        className="object-cover opacity-90 transition-transform duration-1000 ease-out group-hover:scale-105"
                      />
                    ) : (
                      <div className="h-full flex items-center justify-center text-white/20 text-xs uppercase tracking-widest">
                        Image Unavailable
                      </div>
                    )}
                    <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 pointer-events-none">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#1c1c1c]">Concept View</span>
                    </div>
                  </div>
                </div>
              </section>
            );
          })}
        </div>

        {/* --- FINAL EXECUTION GALLERY --- */}
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
                if (!src) return null;

                const spanClass = item.size === "wide" ? "md:col-span-2" : "md:col-span-1";

                return (
                  <div
                    key={idx}
                    className={`relative group overflow-hidden bg-gray-100 cursor-pointer ${spanClass}`}
                    onClick={() => openModal(idx)}
                  >
                    {/* ── Optimized grid image ────────────────────────────
                        sizes: mobile=100vw, tablet=50vw, desktop=33vw
                        (wide items get double width so 66vw on desktop)
                        quality=85: good sharpness without huge file size  */}
                    <Image
                      src={src}
                      alt={`Execution detail ${idx + 1}`}
                      fill
                      quality={85}
                      sizes={
                        item.size === "wide"
                          ? "(max-width: 768px) 100vw, (max-width: 1024px) 100vw, 66vw"
                          : "(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      }
                      // First 3 visible images load eagerly, rest lazy
                      loading={idx < 3 ? "eager" : "lazy"}
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />

                    {/* Hover overlay — pointer-events-none so cursor stays visible */}
                    <div className="absolute inset-0 bg-[#1c1c1c]/0 group-hover:bg-[#1c1c1c]/30 transition-colors duration-500 flex items-center justify-center pointer-events-none">
                      <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 flex flex-col items-center gap-2">
                        <Maximize2 className="w-6 h-6 text-white drop-shadow-lg" />
                        <span className="text-[10px] uppercase tracking-widest text-white font-medium drop-shadow">View</span>
                      </div>
                    </div>

                    {/* Counter badge */}
                    <div className="absolute bottom-3 right-3 bg-black/50 backdrop-blur-sm px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                      <span className="text-[9px] text-white font-mono">{idx + 1} / {galleryItems.length}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* ================================================================ */}
      {/* IMAGE MODAL                                                      */}
      {/* ================================================================ */}
      <AnimatePresence>
        {selectedImageIndex !== null && activeSrc && (
          // ── BACKDROP ──────────────────────────────────────────────────
          // cursor-default ensures the cursor is ALWAYS visible on the overlay
          <motion.div
            key="modal-backdrop"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={`fixed inset-0 z-[9999] flex items-center justify-center cursor-default ${isFullScreen ? "bg-black" : "bg-black/92 backdrop-blur-md p-4 md:p-10"
              }`}
            onClick={closeModal}
          >

            {/* ── MODAL CARD ──────────────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 10 }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
              className={`relative flex flex-col overflow-hidden ${isFullScreen
                ? "w-full h-full"
                : "w-full max-w-5xl rounded-sm shadow-2xl"
                }`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* ── TOP BAR ─────────────────────────────────────────── */}
              <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/70 to-transparent">
                <span className="text-white/60 text-xs font-mono tracking-widest select-none">
                  {selectedImageIndex + 1} &nbsp;/&nbsp; {galleryItems.length}
                </span>
                <div className="flex items-center gap-2">
                  {/* Fullscreen toggle */}
                  <button
                    onClick={toggleFullScreen}
                    title={isFullScreen ? "Exit Full View" : "Full View"}
                    className="cursor-pointer w-8 h-8 flex items-center justify-center rounded-sm bg-white/10 hover:bg-white/25 border border-white/15 text-white transition-all duration-200 hover:scale-110 active:scale-95"
                  >
                    {isFullScreen
                      ? <Minimize2 className="w-4 h-4 pointer-events-none" />
                      : <Maximize2 className="w-4 h-4 pointer-events-none" />
                    }
                  </button>
                  {/* Close */}
                  <button
                    onClick={closeModal}
                    title="Close (Esc)"
                    className="cursor-pointer w-8 h-8 flex items-center justify-center rounded-sm bg-white/10 hover:bg-red-500/70 border border-white/15 text-white transition-all duration-200 hover:scale-110 active:scale-95"
                  >
                    <X className="w-4 h-4 pointer-events-none" />
                  </button>
                </div>
              </div>

              {/* ── MAIN IMAGE with direction-aware slide animation ── */}
              <div className={`relative overflow-hidden bg-neutral-950 ${isFullScreen ? "w-full h-screen" : "w-full aspect-[4/3] md:aspect-[16/10]"
                }`}>
                <AnimatePresence custom={direction.current} mode="popLayout">
                  <motion.div
                    key={selectedImageIndex}
                    custom={direction.current}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                      x: { type: "spring", stiffness: 280, damping: 28 },
                      opacity: { duration: 0.22 },
                      scale: { duration: 0.22 },
                    }}
                    className="absolute inset-0"
                  >
                    {/* ── Active image (quality=90 for full clarity) ── */}
                    <Image
                      src={activeSrc}
                      alt={`Gallery image ${selectedImageIndex + 1}`}
                      fill
                      quality={90}
                      priority
                      sizes="100vw"
                      className="object-contain"
                    />
                  </motion.div>
                </AnimatePresence>

                {/* Hidden prefetch images for instant prev/next load */}
                {prevSrc && prevSrc !== activeSrc && (
                  <Image src={prevSrc} alt="" fill quality={90} sizes="100vw"
                    className="hidden" aria-hidden />
                )}
                {nextSrc && nextSrc !== activeSrc && (
                  <Image src={nextSrc} alt="" fill quality={90} sizes="100vw"
                    className="hidden" aria-hidden />
                )}
              </div>

              {/* ── PREV ARROW ────────────────────────────────────── */}
              {galleryItems.length > 1 && (
                <button
                  onClick={prevImage}
                  title="Previous (←)"
                  className="cursor-pointer absolute left-3 top-1/2 -translate-y-1/2 z-10 w-11 h-11 md:w-13 md:h-13 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/70 border border-white/15 text-white transition-all duration-200 hover:scale-110 hover:-translate-x-0.5 active:scale-95 backdrop-blur-sm"
                >
                  <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 pointer-events-none" />
                </button>
              )}

              {/* ── NEXT ARROW ────────────────────────────────────── */}
              {galleryItems.length > 1 && (
                <button
                  onClick={nextImage}
                  title="Next (→)"
                  className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 z-10 w-11 h-11 md:w-13 md:h-13 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/70 border border-white/15 text-white transition-all duration-200 hover:scale-110 hover:translate-x-0.5 active:scale-95 backdrop-blur-sm"
                >
                  <ChevronRight className="w-5 h-5 md:w-6 md:h-6 pointer-events-none" />
                </button>
              )}

              {/* ── THUMBNAIL STRIP ───────────────────────────────── */}
              {!isFullScreen && galleryItems.length > 1 && (
                <div className="absolute bottom-0 left-0 right-0 z-10 flex items-center justify-center gap-1.5 px-4 py-3 bg-gradient-to-t from-black/70 to-transparent overflow-x-auto">
                  {galleryItems.map((item, idx) => {
                    const thumbSrc = getDriveImage(item.id);
                    if (!thumbSrc) return null;
                    const isActive = idx === selectedImageIndex;
                    return (
                      <button
                        key={idx}
                        onClick={(e) => {
                          e.stopPropagation();
                          direction.current = idx > (selectedImageIndex ?? 0) ? 1 : -1;
                          setSelectedImageIndex(idx);
                        }}
                        className={`cursor-pointer relative flex-shrink-0 overflow-hidden transition-all duration-200 rounded-sm ${isActive
                          ? "w-14 h-9 md:w-18 md:h-12 ring-2 ring-white scale-110 opacity-100"
                          : "w-12 h-8 md:w-16 md:h-10 opacity-45 hover:opacity-80 hover:scale-105"
                          }`}
                      >
                        {/* Thumbnails use quality=25 — tiny, fast, just enough detail */}
                        <Image
                          src={thumbSrc}
                          alt=""
                          fill
                          quality={25}
                          loading="lazy"
                          sizes="80px"
                          className="object-cover pointer-events-none"
                        />
                      </button>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}