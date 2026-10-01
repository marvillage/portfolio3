import type { Config } from "tailwindcss";

// Black-and-white comic palette: ink (page), paper (ink on the page), ash (halftone grey).
const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0a0a0c",
          2: "#141417",
          3: "#1f1f24",
        },
        paper: {
          DEFAULT: "#f3f1ea",
          dim: "#c9c6bc",
        },
        ash: "#8c8a84",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Helvetica Neue", "Arial", "sans-serif"],
        display: ["var(--font-display)", "Impact", "Arial Narrow", "sans-serif"],
        hand: ["var(--font-hand)", "Comic Sans MS", "Segoe Print", "cursive"],
        mono: ["var(--font-mono)", "Consolas", "monospace"],
      },
      boxShadow: {
        ink: "6px 6px 0 #f3f1ea",
        "ink-sm": "4px 4px 0 #f3f1ea",
        ash: "6px 6px 0 #8c8a84",
        "ash-sm": "3px 3px 0 #8c8a84",
        glow: "0 0 18px 2px rgba(243,241,234,0.45)",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
        twinkle: {
          "0%, 100%": { opacity: "0.3" },
          "50%": { opacity: "1" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        flicker: {
          "0%, 100%": { opacity: "1" },
          "92%": { opacity: "1" },
          "93%": { opacity: "0.55" },
          "94%": { opacity: "1" },
          "97%": { opacity: "0.7" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        twinkle: "twinkle 3s ease-in-out infinite",
        "fade-up": "fade-up 0.7s ease-out forwards",
        flicker: "flicker 6s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
