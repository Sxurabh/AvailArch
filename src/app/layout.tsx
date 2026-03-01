// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Providers from "./components/Providers";
import SmoothScroll from "../components/ui/SmoothScroll";
import CustomCursor from "../components/ui/CustomCursor";
import FloatingInquiry from "../components/ui/FloatingInquiry";
import { ThemeProvider } from "@/context/ThemeContext";

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
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Prevent FOUC: apply saved theme before React hydrates */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('avail-theme');if(t)document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`,
          }}
        />
      </head>
      <body className={`${inter.variable} font-sans min-h-screen flex flex-col`}>
        <Providers>
          <ThemeProvider>
            <SmoothScroll>
              {/* UI Overlays */}
              <div className="hidden md:block">
                <CustomCursor />
              </div>
              <FloatingInquiry />

              <Header />
              <main className="flex-grow pt-32 px-6 md:px-12 max-w-[1600px] mx-auto w-full">
                {children}
              </main>
              <Footer />
            </SmoothScroll>
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}