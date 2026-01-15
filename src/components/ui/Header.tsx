"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { signIn, signOut, useSession } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Menu, X } from "lucide-react"; //

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, update } = useSession();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsDropdownOpen(false);
  }, [pathname]);

  // Handle Auth Success
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data === "auth-success") {
        await update();
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
    const popup = window.open("", "google-auth-popup", `width=${width},height=${height},left=${left},top=${top}`);
    
    if (popup) popup.document.body.innerHTML = "<p>Connecting...</p>";

    try {
      const res = await signIn("google", { redirect: false, callbackUrl: "/auth-success" });
      if (popup && res?.url) popup.location.href = res.url;
    } catch (error) {
      popup?.close();
    }
  };

  const navItems = [
    { name: "PROJECTS", path: "/" },
    { name: "ABOUT ME", path: "/about" },
    { name: "CONTACT US", path: "https://forms.gle/7rzapbrJet4Gakfx5" },
  ];

  const userRole = (session?.user as any)?.role;
  const dashboardLink = userRole === "admin" ? "/dashboard" : "/track-request";

  return (
    <>
      {/* HEADER BAR */}
      <header className="fixed top-0 left-0 w-full h-[80px] z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 flex items-center justify-center">
        <div className="w-full flex justify-between items-center px-6 md:px-12 max-w-[1600px]">
          
          {/* LOGO */}
          <Link href="/" className="text-sm font-bold tracking-[0.25em] uppercase z-50">
            Avail Arch
          </Link>

          {/* DESKTOP NAV */}
          <div className="hidden md:flex items-center gap-12">
            <nav className="flex gap-12">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={cn(
                    "text-[10px] font-semibold tracking-[0.2em] transition-colors duration-300 uppercase",
                    pathname === item.path ? "text-black" : "text-gray-400 hover:text-black"
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* DESKTOP USER PROFILE */}
            {session?.user ? (
              <div className="relative" ref={dropdownRef}>
                <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="w-8 h-8 rounded-full overflow-hidden border hover:border-black transition-colors">
                  {session.user.image ? <Image src={session.user.image} alt="User" fill className="object-cover " /> : <div className="bg-gray-200 w-full h-full" />}
                </button>
                {/* Dropdown Content omitted for brevity - same as before */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-4 w-56 bg-white border border-gray-100 shadow-xl py-2">
                    <Link href={dashboardLink} className="block px-4 py-2 text-[10px] uppercase tracking-widest hover:bg-gray-50">Dashboard</Link>
                    <button onClick={() => signOut()} className="block w-full text-left px-4 py-2 text-[10px] uppercase tracking-widest text-red-500 hover:bg-gray-50">Sign Out</button>
                  </div>
                )}
              </div>
            ) : (
              <button onClick={handleSignIn} className="text-[10px] font-semibold tracking-[0.2em] uppercase bg-black text-white px-5 py-2 hover:bg-gray-800">
                Sign In
              </button>
            )}
          </div>

          {/* MOBILE TOGGLE BUTTON */}
          <button 
            className="md:hidden z-50 p-2 text-black"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* MOBILE MENU OVERLAY */}
      <div 
        className={cn(
          "fixed inset-0 bg-white z-40 pt-24 px-6 flex flex-col gap-6 transition-transform duration-300 ease-in-out md:hidden",
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {navItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className="text-xl font-bold tracking-[0.2em] uppercase border-b border-gray-100 pb-4"
          >
            {item.name}
          </Link>
        ))}

        {session?.user ? (
          <div className="mt-4 flex flex-col gap-4">
             <div className="flex items-center gap-4">
                <div className="w-10 h-10 relative rounded-full overflow-hidden bg-gray-200">
                   {session.user.image && <Image src={session.user.image} alt="user" fill className="object-cover"/>}
                </div>
                <div>
                   <p className="text-xs font-bold uppercase">{session.user.name}</p>
                   <p className="text-[10px] text-gray-500">{session.user.email}</p>
                </div>
             </div>
             <Link href={dashboardLink} className="text-sm uppercase tracking-widest bg-gray-100 p-3 text-center">
               Dashboard
             </Link>
             <button onClick={() => signOut()} className="text-sm uppercase tracking-widest text-red-500 border border-red-500 p-3">
               Sign Out
             </button>
          </div>
        ) : (
          <button onClick={handleSignIn} className="mt-8 text-sm font-bold tracking-[0.2em] uppercase bg-black text-white py-4">
            Sign In
          </button>
        )}
      </div>
    </>
  );
}