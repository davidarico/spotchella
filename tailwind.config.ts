import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-jakarta)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-bebas)", "var(--font-jakarta)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        dune: {
          900: "rgb(22, 20, 19)",
          800: "rgb(40, 32, 32)",
        },
      },
      backgroundImage: {
        "dune-hero":
          "radial-gradient(120% 80% at 50% 0%, rgb(255 210 200 / 0.5) 0%, transparent 50%), linear-gradient(165deg, #fff3eb 0%, #ffd6e8 32%, #e8b8ff 58%, #c4a0ff 78%, #3d2a55 100%)",
        "poster-sun": "radial-gradient(100% 70% at 50% 5%, #ffe8c8 0%, #ffb8a8 28%, #d890c0 45%, #7048a8 70%, #1a1024 100%)",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "none" },
        },
      },
      animation: { "fade-in": "fadeIn 0.4s ease-out" },
    },
  },
  plugins: [],
} satisfies Config;
