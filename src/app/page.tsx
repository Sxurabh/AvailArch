// src/app/page.tsx
"use client";

import ProjectGrid from "./components/ProjectGrid";

export default function Home() {
  return (
    <div className="pb-24">
      {/* Projects Grid */}
      <section>
        <ProjectGrid />
      </section>
    </div>
  );
}