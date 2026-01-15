"use client";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const steps = [
  {
    number: "01",
    title: "Discovery",
    subtitle: "Concept & Strategy",
    description: "We begin by understanding your lifestyle and vision. Through mood boards and initial sketches, we define the aesthetic direction of your space."
  },
  {
    number: "02",
    title: "Development",
    subtitle: "Design & Visualization",
    description: "Our team drafts detailed layouts, selects materials, and creates photorealistic 3D renders so you can visualize every corner before construction begins."
  },
  {
    number: "03",
    title: "Execution",
    subtitle: "Procurement & Build",
    description: "We handle the logistics—ordering furniture, coordinating contractors, and overseeing the site to ensure the design is executed flawlessly."
  },
  {
    number: "04",
    title: "Completion",
    subtitle: "Styling & Handover",
    description: "The styling phase. We place every accessory and artwork, leaving you with a turnkey home ready for living."
  }
];

export default function ProcessTimeline() {
  return (
    <section className="py-32 border-t border-gray-200">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Sticky Sidebar (Left) */}
        <div className="lg:col-span-4 relative">
          <div className="sticky top-40">
            <h2 className="text-4xl md:text-5xl font-light tracking-tight text-black mb-4 font-serif">
              The Process
            </h2>
            <p className="text-xs text-gray-400 uppercase tracking-widest leading-relaxed max-w-xs">
              A curated journey from initial concept to the final reveal. We handle the complexity so you can enjoy the creation.
            </p>
          </div>
        </div>

        {/* Steps List (Right) */}
        <div className="lg:col-span-8">
          <div className="flex flex-col">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group border-t border-gray-200 py-12 transition-colors duration-500 "
              >
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                  
                  {/* Number */}
                  <div className="md:col-span-2">
                    <span className="text-xs font-mono text-gray-400 group-hover:text-black transition-colors">
                      ({step.number})
                    </span>
                  </div>

                  {/* Title & Subtitle */}
                  <div className="md:col-span-5">
                    <h3 className="text-2xl font-light text-black mb-1 group-hover:translate-x-2 transition-transform duration-500 ease-out">
                      {step.title}
                    </h3>
                    <span className="text-[10px] uppercase tracking-widest text-gray-400">
                      {step.subtitle}
                    </span>
                  </div>

                  {/* Description */}
                  <div className="md:col-span-5">
                    <p className="text-sm text-gray-500 leading-7 font-light group-hover:text-gray-800 transition-colors">
                      {step.description}
                    </p>
                  </div>

                </div>
              </motion.div>
            ))}
            
            {/* Final Border */}
            <div className="border-t border-gray-200" />
          </div>
        </div>
      </div>
    </section>
  );
}