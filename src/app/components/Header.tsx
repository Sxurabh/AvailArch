// src/app/components/Header.tsx
"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { signIn, signOut, useSession } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Menu, X } from "lucide-react"; // 🆕 Icons
import { AnimatePresence, motion } from "framer-motion"; // 🆕 Animations

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, update } = useSession();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // 🆕
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data === "auth-success") {
        await update(); 
        setIsDropdownOpen(false);
        router.push("/");
        router.refresh();
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [update, router]);

  const handleSignIn = async () => {
    const width = 500;
    const height = 600;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;
    const popup = window.open("", "google-auth-popup", `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,status=yes`);
    
    if (popup) popup.document.body.innerHTML = "<p>Contacting Google...</p>";

    try {
      const res = await signIn("google", { redirect: false, callbackUrl: "/auth-success" });
      if (popup && res?.url) popup.location.href = res.url;
      else popup?.close();
    } catch (error) {
      popup?.close();
      console.error("Sign in failed", error);
    }
  };

  // 🟢 Role Logic
  const userRole = (session?.user as any)?.role;
  const isAdmin = userRole === "admin";
  const isClient = session?.user && !isAdmin;

  // Base Items
  const navItems = [
    { name: "PROJECTS", path: "/" },
    { name: "ABOUT ME", path: "/about" },
  ];

  // Role Specific Items
  if (isAdmin) {
    navItems.push({ name: "DASHBOARD", path: "/dashboard" });
  } else if (isClient) {
    navItems.push({ name: "TRACK REQUEST", path: "/track-request" });
  } else {
    navItems.push({ name: "CONTACT US", path: "https://forms.gle/7rzapbrJet4Gakfx5" });
  }

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-50 bg-white/95 backdrop-blur-sm transition-all duration-500 border-b border-transparent hover:border-gray-100">
        <div className="flex justify-between items-center px-6 py-6 md:px-12 max-w-[1600px] mx-auto">
          <Link href="/" className="text-sm font-bold tracking-[0.25em] uppercase hover:opacity-50 transition-opacity z-50 relative">
            Avail Arch
          </Link>

          <div className="flex items-center gap-4 md:gap-12">
            {/* Desktop Navigation */}
            <nav className="hidden md:flex gap-12">
              {navItems.map((item) => {
                const isExternal = item.path.startsWith("http");
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    target={isExternal ? "_blank" : undefined}
                    rel={isExternal ? "noopener noreferrer" : undefined}
                    className={cn(
                      "text-[10px] font-semibold tracking-[0.2em] transition-colors duration-300 uppercase",
                      pathname === item.path ? "text-black" : "text-gray-400 hover:text-black"
                    )}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* Auth Button / User Dropdown */}
            {session?.user ? (
              <div className="relative" ref={dropdownRef}>
                <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="relative w-8 h-8 rounded-full overflow-hidden border border-gray-200 hover:border-black transition-colors">
                  {session.user.image ? (
                    <Image src={session.user.image} alt="User" fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-[10px]">{session.user.name?.charAt(0)}</div>
                  )}
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-4 w-56 bg-white border border-gray-100 shadow-[0_2px_20px_-5px_rgba(0,0,0,0.1)] py-2 animate-fade-in-up z-50">
                    <div className="px-4 py-3 border-b border-gray-50 mb-2">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Signed in as</p>
                      <p className="text-xs font-medium truncate text-black">{session.user.email}</p>
                    </div>
                    
                    {!isAdmin && (
                       <Link 
                         href="/track-request"
                         onClick={() => setIsDropdownOpen(false)}
                         className="block px-4 py-2.5 text-[10px] uppercase tracking-[0.15em] hover:bg-gray-50 transition-colors"
                       >
                         Track Request
                       </Link>
                    )}
                    
                    <button onClick={() => { setIsDropdownOpen(false); signOut({ callbackUrl: "/" }); }} className="w-full text-left block px-4 py-2.5 text-[10px] uppercase tracking-[0.15em] text-red-500 hover:bg-gray-50 transition-colors">
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button onClick={handleSignIn} className="hidden md:block text-[10px] font-semibold tracking-[0.2em] uppercase bg-black text-white px-5 py-2 hover:bg-gray-800 transition-colors">
                Sign In
              </button>
            )}

            {/* 🆕 Mobile Menu Toggle */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
              className="md:hidden p-2 -mr-2 text-black z-50 relative"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* 🆕 Mobile Fullscreen Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: "-100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "-100%" }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 bg-white z-40 flex flex-col justify-center items-center gap-8 md:hidden"
          >
            {navItems.map((item, index) => (
              <motion.div
                key={item.path}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.1 }}
              >
                <Link
                  href={item.path}
                  className="text-2xl font-light uppercase tracking-widest text-black hover:text-gray-500 transition-colors"
                >
                  {item.name}
                </Link>
              </motion.div>
            ))}

            {/* Mobile Sign In (if not logged in) */}
            {!session?.user && (
               <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleSignIn();
                }}
                className="mt-8 text-xs font-bold uppercase tracking-[0.2em] border border-black px-8 py-3 hover:bg-black hover:text-white transition-all"
               >
                 Sign In
               </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}