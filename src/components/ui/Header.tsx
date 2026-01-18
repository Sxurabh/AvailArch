// src/components/ui/Header.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, User } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

// Helper for standard Nav Links
const NavLink = ({ href, children, isActive }: { href: string; children: React.ReactNode; isActive: boolean }) => (
  <Link
    href={href}
    className={cn(
      "text-xs uppercase tracking-[0.2em] transition-all relative py-1",
      isActive ? "text-black font-bold" : "text-gray-500 hover:text-black"
    )}
  >
    {children}
    {isActive && (
      <motion.div
        layoutId="underline"
        className="absolute left-0 top-full w-full h-[2px] bg-[#bfff00] mt-1"
      />
    )}
  </Link>
);

export default function Header() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Projects", href: "/" },
    { name: "About", href: "/about" },
    { name: "Process", href: "/#process" },
    { name: "Contact", href: "/#contact" },
  ];

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b",
          isScrolled
            ? "bg-white/90 backdrop-blur-md py-4 border-gray-100 shadow-sm"
            : "bg-transparent py-6 border-transparent"
        )}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          
          {/* LOGO */}
          <Link href="/" className="z-50 group">
            <span className="text-xl font-light tracking-tighter uppercase">
              Avail<span className="font-bold group-hover:text-[#bfff00] transition-colors">Arch</span>
            </span>
          </Link>

          {/* DESKTOP NAV */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <NavLink key={link.href} href={link.href} isActive={pathname === link.href}>
                {link.name}
              </NavLink>
            ))}
          </nav>

          {/* USER ACTIONS */}
          <div className="hidden md:flex items-center gap-6">
            {session ? (
              <div className="flex items-center gap-4">
                 <Link href="/dashboard" className="text-[10px] uppercase tracking-widest text-gray-400 hover:text-black">
                    Dashboard
                 </Link>
                 
                 {/* 🟢 UPDATED: Avatar with Ignore Attribute */}
                 <button 
                    onClick={() => signOut()}
                    data-cursor-ignore="true" // 👈 This triggers the custom cursor to disappear
                    className="relative group w-9 h-9 rounded-full overflow-hidden border border-gray-200 hover:border-black transition-all"
                    title="Sign Out"
                 >
                    <div className="w-full h-full bg-gray-100">
                        {session.user?.image ? (
                        <Image
                            src={session.user.image}
                            alt="User"
                            fill
                            className="object-cover hover:opacity-80 transition-opacity" 
                        />
                        ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                            <User size={16} />
                        </div>
                        )}
                    </div>
                 </button>
              </div>
            ) : (
              <button
                onClick={() => signIn("google")}
                className="text-xs font-bold uppercase tracking-[0.2em] bg-black text-white px-5 py-2 hover:bg-[#bfff00] hover:text-black transition-colors"
              >
                Login
              </button>
            )}
          </div>

          {/* MOBILE MENU TOGGLE */}
          <button
            className="md:hidden z-50 text-black p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </header>
      
      {/* MOBILE MENU (Unchanged) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-white pt-24 px-6 md:hidden flex flex-col gap-8"
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-2xl font-light uppercase tracking-widest border-b border-gray-100 pb-4"
              >
                {link.name}
              </Link>
            ))}
             <div className="mt-auto pb-12 border-t border-gray-100 pt-8">
               {session ? (
                  <button onClick={() => signOut()} className="text-xl uppercase tracking-widest font-bold text-red-500">
                    Sign Out
                  </button>
               ) : (
                  <button onClick={() => signIn("google")} className="text-xl uppercase tracking-widest font-bold">
                    Login
                  </button>
               )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}