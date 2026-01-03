import type { Config } from "tailwindcss";

const config: Config = {
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
        foreground: "#111111", // Stark black for text
        muted: "#9CA3AF",      // Architectural cool-grey
        border: "#E5E5E5",     // Very light borders
      },
      letterSpacing: {
        widest: '.2em',       // The signature "spaced out" look
        tighter: '-.02em',
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