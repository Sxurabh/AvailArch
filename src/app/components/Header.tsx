"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "../lib/utils";

export default function Header() {
  const pathname = usePathname();

  const navItems = [
    { name: "PROJECTS", path: "/" },
    { name: "BLOG", path: "/blog" },
    { name: "ABOUT ME", path: "/about" },
  ];

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white/95 backdrop-blur-sm transition-all duration-500">
      <div className="flex justify-between items-center px-6 py-8 md:px-12 max-w-[1600px] mx-auto">
        {/* Logo */}
        <Link 
          href="/" 
          className="text-sm font-bold tracking-[0.25em] uppercase hover:opacity-50 transition-opacity"
        >
          Avail Arch
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex gap-12">
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={cn(
                "text-[10px] font-semibold tracking-[0.2em] transition-colors duration-300 uppercase",
                pathname === item.path 
                  ? "text-black" 
                  : "text-gray-400 hover:text-black"
              )}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Mobile Nav Button */}
        <button className="md:hidden text-[10px] font-semibold tracking-[0.2em] uppercase">
          Menu
        </button>
      </div>
    </header>
  );
}