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
    <header className="fixed top-0 left-0 w-full z-50 bg-white/90 backdrop-blur-sm dark:bg-black/90 transition-colors duration-300">
      <div className="flex justify-between items-center px-6 py-6 md:px-12 max-w-7xl mx-auto">
        <Link href="/" className="text-lg font-bold tracking-widest uppercase hover:opacity-70 transition-opacity">
          Mi Zhou
        </Link>

        <nav className="hidden md:flex gap-8">
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={cn(
                "text-sm font-medium tracking-wide transition-colors hover:text-black dark:hover:text-white",
                pathname === item.path ? "text-black dark:text-white" : "text-gray-500 dark:text-gray-400"
              )}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Mobile Menu Icon Placeholder */}
        <button className="md:hidden text-sm uppercase">Menu</button>
      </div>
    </header>
  );
}