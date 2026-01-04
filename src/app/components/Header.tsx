"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { signIn, signOut, useSession } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, update } = useSession();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null); // 🟢 Ref for the dropdown container

  // 🟢 CLOSE DROPDOWN ON CLICK OUTSIDE
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Listen for the popup's success message
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

    const popup = window.open(
      "", 
      "google-auth-popup", 
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,status=yes`
    );

    if (popup) {
      popup.document.body.innerHTML = `
        <style>body{font-family:sans-serif;display:flex;justify-content:center;align-items:center;height:100vh;margin:0;background:#fff;color:#000;text-transform:uppercase;letter-spacing:0.2em;font-size:12px;font-weight:bold;}</style>
        <p>Contacting Google...</p>
      `;
    }

    try {
      const res = await signIn("google", { 
        redirect: false, 
        callbackUrl: "/auth-success" 
      });

      if (popup && res?.url) {
        popup.location.href = res.url;
        popup.focus();
      } else {
        popup?.close();
      }
    } catch (error) {
      popup?.close();
      console.error("Sign in failed", error);
    }
  };

  const navItems = [
    { name: "PROJECTS", path: "/" },
    { name: "ABOUT ME", path: "/about" },
    { name: "CONTACT US", path: "https://forms.gle/7rzapbrJet4Gakfx5" },
  ];

  const userRole = (session?.user as any)?.role;
  const dashboardLink = userRole === "admin" ? "/dashboard" : "/track-request";
  const dashboardLabel = userRole === "admin" ? "ADMIN DASHBOARD" : "TRACK REQUEST";

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white/95 backdrop-blur-sm transition-all duration-500 border-b border-transparent hover:border-gray-100">
      <div className="flex justify-between items-center px-6 py-6 md:px-12 max-w-[1600px] mx-auto">
        <Link 
          href="/" 
          className="text-sm font-bold tracking-[0.25em] uppercase hover:opacity-50 transition-opacity"
        >
          Avail Arch
        </Link>

        <div className="flex items-center gap-12">
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
                    pathname === item.path 
                      ? "text-black" 
                      : "text-gray-400 hover:text-black"
                  )}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {session?.user ? (
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="relative w-8 h-8 rounded-full overflow-hidden border border-gray-200 hover:border-black transition-colors"
              >
                {session.user.image ? (
                  <Image 
                    src={session.user.image} 
                    alt="User" 
                    fill 
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center text-[10px]">
                    {session.user.name?.charAt(0)}
                  </div>
                )}
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-4 w-56 bg-white border border-gray-100 shadow-[0_2px_20px_-5px_rgba(0,0,0,0.1)] py-2 animate-fade-in-up z-50">
                  <div className="px-4 py-3 border-b border-gray-50 mb-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Signed in as</p>
                    <p className="text-xs font-medium truncate text-black">{session.user.email}</p>
                  </div>
                  
                  <Link 
                    href={dashboardLink}
                    onClick={() => setIsDropdownOpen(false)}
                    className="block px-4 py-2.5 text-[10px] uppercase tracking-[0.15em] hover:bg-gray-50 transition-colors"
                  >
                    {dashboardLabel}
                  </Link>
                  
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      signOut({ callbackUrl: "/" });
                    }}
                    className="w-full text-left block px-4 py-2.5 text-[10px] uppercase tracking-[0.15em] text-red-500 hover:bg-gray-50 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={handleSignIn}
              className="text-[10px] font-semibold tracking-[0.2em] uppercase bg-black text-white px-5 py-2 hover:bg-gray-800 transition-colors"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
}