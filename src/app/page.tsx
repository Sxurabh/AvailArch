// src/app/page.tsx
"use client";

import ProjectGrid from "./components/ProjectGrid"; // Adjust import path if needed
import ProcessTimeline from "../components/ui/ProcessTimeline"; // 🆕
import AwardsMarquee from "../components/ui/AwardsMarquee";     // 🆕

export default function Home() {
  return (
    <div className="space-y-32 pb-24">
      

      {/* Projects Grid */}
      <section>
        <ProjectGrid />
      </section>
      <AwardsMarquee />

      {/* 🆕 Process Timeline (Explaining how you work) */}
      <ProcessTimeline />

    </div>
  );
}