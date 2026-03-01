// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "unsplash.com",
      },
      {
        protocol: "https",
        hostname: "plus.unsplash.com",
      },
      // 🟢 ALLOW GOOGLE DRIVE & CONTENT DOMAINS
      {
        protocol: "https",
        hostname: "drive.google.com",
      },
      {
        protocol: "https",
        hostname: "*.googleusercontent.com",
      },
      // 🟢 ALLOW INTERIOR DESIGN DOMAIN
      {
        protocol: "https",
        hostname: "interiordesign.net",
      },
      // 🟢 SUPABASE STORAGE (Optimized Images)
      {
        protocol: "https",
        hostname: "xjbxqjbzrgmlgjkfqfnc.supabase.co",
      },
    ],
  },
};

export default nextConfig;