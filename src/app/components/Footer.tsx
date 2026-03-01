"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full pb-12 mt-16">
      <div className="max-w-[1600px] mx-auto px-6 md:px-12">
        <div className="pt-24 pb-12 px-8 md:px-16 lg:px-24 selection:bg-[#8a9a5b]" style={{ background: 'rgb(var(--fg))', color: 'rgb(var(--bg))' }}>
          <div className="flex flex-col gap-24">

            {/* Top Section: Asymmetric Layout */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-16 md:gap-8">

              {/* 70% Width: Massive Brand & Newsletter */}
              <div className="md:col-span-8 flex flex-col justify-between">
                <div>
                  <h2 className="text-5xl md:text-[6rem] lg:text-[10rem] font-bold uppercase tracking-tighter leading-[0.8] mb-8">
                    AVAIL <br /> ARCH
                  </h2>
                  <p className="text-white/60 font-light max-w-md text-sm md:text-base">
                    Architectural design and spatial ideation based in rigorous constraint-solving methodologies.
                  </p>
                </div>

                <div className="mt-20 md:mt-32 max-w-md">
                  <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#8a9a5b] mb-4">
                    Studio Briefing
                  </p>
                  <div className="flex border-b border-white/30 focus-within:border-[#8a9a5b] transition-colors pb-2">
                    <input
                      type="email"
                      placeholder="Email address for studio updates"
                      className="bg-transparent w-full outline-none text-sm placeholder:text-white/30 text-white font-mono"
                    />
                    <button className="text-white/50 hover:text-[#8a9a5b] transition-colors">
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* 30% Width: Navigation Links */}
              <div className="md:col-span-4 grid grid-cols-2 gap-8 md:pl-12 lg:pl-24">
                <div className="flex flex-col gap-4">
                  <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/40 mb-2">Platform</p>
                  <Link href="/" className="text-sm font-medium hover:text-[#8a9a5b] transition-colors">Home</Link>
                  <Link href="/about" className="text-sm font-medium hover:text-[#8a9a5b] transition-colors">Studio</Link>
                  <Link href="/process" className="text-sm font-medium hover:text-[#8a9a5b] transition-colors">Process</Link>
                  <Link href="/track-request" className="text-sm font-medium hover:text-[#8a9a5b] transition-colors">Initiate</Link>
                </div>

                <div className="flex flex-col gap-4">
                  <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/40 mb-2">Social</p>
                  <a href="#" className="text-sm font-medium hover:text-[#8a9a5b] transition-colors">Instagram</a>
                  <a href="#" className="text-sm font-medium hover:text-[#8a9a5b] transition-colors">LinkedIn</a>
                  <a href="#" className="text-sm font-medium hover:text-[#8a9a5b] transition-colors">Behance</a>
                  <a href="#" className="text-sm font-medium hover:text-[#8a9a5b] transition-colors">ArchDaily</a>
                </div>
              </div>

            </div>

            {/* Bottom Section: Copyright & Legal */}
            <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <p className="text-[10px] text-white/40 uppercase tracking-[0.1em] font-mono">
                © {new Date().getFullYear()} Avail Arch. All Rights Reserved.
              </p>

              <div className="flex gap-6">
                <Link href="#" className="text-[10px] text-white/40 uppercase tracking-[0.1em] hover:text-white transition-colors">Privacy Policy</Link>
                <Link href="#" className="text-[10px] text-white/40 uppercase tracking-[0.1em] hover:text-white transition-colors">Terms of Service</Link>
              </div>
            </div>

          </div>
        </div>
      </div>
    </footer>
  );
}