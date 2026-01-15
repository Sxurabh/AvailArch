// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Providers from "./components/Providers";
import SmoothScroll from "../components/ui/SmoothScroll";
import CustomCursor from "../components/ui/CustomCursor";
import FloatingInquiry from "../components/ui/FloatingInquiry"; // 🆕

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Avail Arch | Portfolio",
  description: "Architecture and Design Portfolio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans min-h-screen flex flex-col`}>
        <Providers>
          <SmoothScroll>
            {/* UI Overlays */}
            <div className="hidden md:block">
               <CustomCursor />
            </div>
            <FloatingInquiry /> {/* 🆕 Added here */}
            
            <Header />
            <main className="flex-grow pt-32 px-6 md:px-12 max-w-[1600px] mx-auto w-full">
              {children}
            </main>
            <Footer />
          </SmoothScroll>
        </Providers>
      </body>
    </html>
  );
}