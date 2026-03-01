"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ArrowRight, Box, Compass, Hammer, Scaling } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

const PHASES = [
    {
        id: "01",
        title: "Concept & Discovery",
        subtitle: "Understanding the Vision",
        icon: Compass,
        description: "Every interior project begins with a deep dive into how you live, work, and interact with your space. We analyze functional needs, aesthetic preferences, and the existing architectural envelope to create a unified design narrative.",
        deliverables: ["Lifestyle Questionnaire", "Concept Moodboards", "Spatial Flow Analysis", "Initial Budget Strategy"],
        image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2800&auto=format&fit=crop"
    },
    {
        id: "02",
        title: "Spatial Planning",
        subtitle: "Defining the Flow",
        icon: Box,
        description: "Form follows function. We develop comprehensive floor plans and furniture layouts that optimize the volume of the space. This phase establishes the foundation for circulation, scale, and proportion before decorative elements are introduced.",
        deliverables: ["2D Floor Plans", "Furniture Layouts", "Lighting Strategies", "Volumetric Studies"],
        image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=2800&auto=format&fit=crop"
    },
    {
        id: "03",
        title: "Material & Detail",
        subtitle: "Curating the Elements",
        icon: Scaling,
        description: "This is where the tactile language of the space is defined. We select hard finishes, fixtures, bespoke millwork, fabrics, and furniture. Every texture and tone is meticulously sourced to align with the overarching conceptual narrative.",
        deliverables: ["Material Palettes", "Custom Millwork Drawings", "FF&E Schedules (Furniture, Fixtures & Equipment)", "3D Renderings"],
        image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=2800&auto=format&fit=crop"
    },
    {
        id: "04",
        title: "Installation & Styling",
        subtitle: "Bringing it to Life",
        icon: Hammer,
        description: "We oversee the procurement, delivery, and final installation of all elements. From coordinating with contractors on custom build-outs to the final placement of art and accessories, we ensure the vision is executed flawlessly.",
        deliverables: ["Procurement Management", "Contractor Coordination", "White-glove Installation", "Final Styling & Handover"],
        image: "https://images.unsplash.com/photo-1616137688172-2aa5c721bbaa?q=80&w=2800&auto=format&fit=crop"
    }
];

export default function ProcessContent() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    return (
        <div ref={containerRef} className="relative w-full overflow-hidden pb-32 pt-[100px]" style={{ background: 'rgb(var(--bg-surface))', color: 'rgb(var(--fg))' }}>

            {/* Dynamic Progress Bar */}
            <motion.div
                className="fixed top-0 left-0 h-1 bg-[#8a9a5b] z-50 transform origin-left"
                style={{ scaleX: scrollYProgress }}
            />

            {/* --- HERO SECTION --- */}
            <section className="relative h-screen flex flex-col justify-end pb-24 px-6 md:px-12 border-b border-[rgba(var(--fg),0.1)]">
                <div className="max-w-7xl mx-auto w-full flex flex-col items-start z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <p className="text-[#8a9a5b] text-xs uppercase tracking-[0.3em] mb-6 flex items-center gap-4">
                            <span className="w-8 h-[1px] bg-[#8a9a5b]"></span>
                            Methodology
                        </p>
                        <h1 className="text-5xl md:text-8xl lg:text-[10rem] font-bold uppercase tracking-tighter leading-[0.8] mix-blend-difference mb-8">
                            PROCESS <br />
                            <span className="text-transparent stroke-text font-light block mt-4">DRIVEN.</span>
                        </h1>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 0.4 }}
                        className="w-full md:w-1/2 ml-auto"
                    >
                        <p className="text-xl md:text-2xl text-[rgba(var(--fg),0.7)] font-light leading-relaxed">
                            We do not impose a predetermined style. Our design language emerges from a rigorous, 4-phase methodology that transforms complex constraints into curated spaces tailored to how you live.
                        </p>
                    </motion.div>
                </div>

                {/* Ambient Video/Image Background */}
                <div className="absolute inset-0 z-0 opacity-30 mix-blend-luminosity">
                    <Image
                        src="https://images.unsplash.com/photo-1618220179428-2279ecb11f47?q=80&w=2800&auto=format&fit=crop"
                        alt="Interior Design Studio"
                        fill
                        className="object-cover"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                </div>
            </section>

            {/* --- PHASES --- */}
            <div className="relative">
                {PHASES.map((phase, index) => (
                    <PhaseSection key={phase.id} phase={phase} index={index} />
                ))}
            </div>

            {/* --- CTA --- */}
            <section className="py-40 px-6 md:px-12 bg-[#8a9a5b] text-[#1c1c1c]">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
                    <div>
                        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none mb-4">
                            Ready to Build?
                        </h2>
                        <p className="text-sm md:text-base font-medium max-w-md">
                            Initiate phase 01. Submit your project requirements and let's begin the architectural dialogue.
                        </p>
                    </div>

                    <Link
                        href="/track-request"
                        className="group relative inline-flex items-center gap-4 px-10 py-6 bg-[rgba(var(--bg),1)] text-[rgba(var(--fg),1)] hover:bg-white hover:text-[#1c1c1c] transition-colors duration-300"
                    >
                        <span className="text-xs font-bold uppercase tracking-[0.2em] relative z-10">
                            Start a Project
                        </span>
                        <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-2 transition-transform" />
                    </Link>
                </div>
            </section>

            {/* CSS For Stroke Text */}
            <style jsx global>{`
        .stroke-text {
          -webkit-text-stroke: 1px rgba(255, 255, 255, 0.5);
          color: transparent;
        }
      `}</style>
        </div>
    );
}

// Sub-component for Parallax Phase Sections
function PhaseSection({ phase, index }: { phase: any, index: number }) {
    const ref = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"]
    });

    // Parallax logic logic
    const imgY = useTransform(scrollYProgress, [0, 1], ["-20%", "20%"]);
    const textY = useTransform(scrollYProgress, [0, 1], ["20%", "-20%"]);

    return (
        <section ref={ref} className="min-h-screen flex items-center justify-center py-24 px-6 md:px-12 relative overflow-hidden">
            <div className={cn(
                "max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center z-10",
                index % 2 !== 0 && "lg:grid-flow-col-dense"
            )}>

                {/* Text Block */}
                <motion.div
                    style={{ y: textY }}
                    className={cn("flex flex-col gap-6", index % 2 !== 0 && "lg:col-start-2 lg:pl-12")}
                >
                    <div className="flex items-center gap-4 text-[#8a9a5b]">
                        <phase.icon className="w-8 h-8 stroke-[1.5]" />
                        <span className="text-sm font-mono font-bold">PHASE {phase.id}</span>
                    </div>

                    <div>
                        <h2 className="text-4xl md:text-6xl font-bold uppercase tracking-tighter mb-2">{phase.title}</h2>
                        <h3 className="text-xl md:text-2xl text-[rgba(var(--fg),0.5)] font-light italic">{phase.subtitle}</h3>
                    </div>

                    <p className="text-lg text-[rgba(var(--fg),0.8)] leading-relaxed font-light mt-4">
                        {phase.description}
                    </p>

                    <div className="mt-8 pt-8 border-t border-[rgba(var(--fg),0.1)]">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-[#8a9a5b] mb-6 font-bold">Key Deliverables</p>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                            {phase.deliverables.map((item: string, i: number) => (
                                <li key={i} className="flex items-start gap-3 text-sm text-[rgba(var(--fg),0.7)]">
                                    <span className="w-1.5 h-1.5 bg-[rgba(var(--fg),0.3)] rounded-full mt-1.5 flex-shrink-0" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </motion.div>

                {/* Image Block */}
                <div className={cn(
                    "relative h-[60vh] lg:h-[80vh] w-full overflow-hidden bg-[rgba(var(--fg),0.05)]",
                    index % 2 !== 0 && "lg:col-start-1"
                )}>
                    <motion.div
                        style={{ y: imgY }}
                        className="absolute inset-0 -top-[30%] -bottom-[30%]"
                    >
                        <Image
                            src={phase.image}
                            alt={phase.title}
                            fill
                            className="object-cover grayscale hover:grayscale-0 transition-all duration-700"
                        />
                    </motion.div>

                    {/* Architectural Overlay Lines */}
                    <div className="absolute inset-0 border border-[rgba(var(--fg),0.2)] z-10 pointer-events-none" />
                    <div className="absolute top-1/2 w-full h-[1px] bg-[rgba(var(--fg),0.1)] z-10 pointer-events-none mix-blend-overlay" />
                    <div className="absolute left-1/2 w-[1px] h-full bg-[rgba(var(--fg),0.1)] z-10 pointer-events-none mix-blend-overlay" />
                </div>
            </div>

            {/* Background Phase Number Watermark */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[40vw] font-black text-[rgba(var(--fg),1)]/[0.02] pointer-events-none z-0 user-select-none">
                {phase.id}
            </div>
        </section>
    );
}

