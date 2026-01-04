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
        hostname: "unsplash.com", // 🟢 FIX: Stops the crash for root domain links
      },
      {
        protocol: "https",
        hostname: "plus.unsplash.com", // Covers new Unsplash Plus URLs
      },
      {
        protocol: "https",
        hostname: "*.googleusercontent.com", 
      },
    ],
  },
};

export default nextConfig;