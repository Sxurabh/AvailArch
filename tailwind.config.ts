import type { Config } from "tailwindcss";

const config: Config = {
  // 🟢 CRITICAL: This ensures Tailwind finds files inside 'src'
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
      },
      colors: {
        background: "#ffffff",
        foreground: "#111111",
        // A specific warm grey used in architectural portfolios
        muted: "#9CA3AF", 
        border: "#E5E5E5",
      },
      letterSpacing: {
        // "Architectural" spacing
        widest: '.2em', 
      },
      fontSize: {
        // "Micro" text sizes for labels
        xxs: ['0.65rem', { lineHeight: '1rem' }],
      },
      animation: {
        "fade-in-up": "fadeInUp 0.8s ease-out forwards",
      },
      keyframes: {
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;