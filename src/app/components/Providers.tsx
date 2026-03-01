"use client";

// Providers wrapper - keeping file to avoid layout breaks, but removed SessionProvider
export default function Providers({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}