"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils"; // If using shadcn or just install clsx tailwind-merge

// Simple utility if you don't have the lib/utils file yet:
function cn(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export default function Header() {
  const pathname = usePathname();

  const navItems = [
    { name: "PROJECTS", path: "/" },
    { name: "BLOG", path: "/blog" },
    { name: "ABOUT ME", path: "/about" },
  ];

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-background/90 backdrop-blur-sm">
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
                "text-sm font-medium tracking-wide transition-colors hover:text-black",
                pathname === item.path ? "text-black" : "text-muted"
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