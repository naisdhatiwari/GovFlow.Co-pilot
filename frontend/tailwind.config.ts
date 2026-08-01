import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#070a12",
        foreground: "#f3f4f6",
        card: {
          DEFAULT: "rgba(15, 23, 42, 0.65)",
          foreground: "#f8fafc",
        },
        primary: {
          DEFAULT: "#0ea5e9",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#1e293b",
          foreground: "#cbd5e1",
        },
        accent: {
          DEFAULT: "#06b6d4",
          foreground: "#0f172a",
        },
        pass: {
          DEFAULT: "#10b981",
          glow: "rgba(16, 185, 129, 0.3)",
        },
        review: {
          DEFAULT: "#f59e0b",
          glow: "rgba(245, 158, 11, 0.3)",
        },
        flag: {
          DEFAULT: "#f43f5e",
          glow: "rgba(244, 63, 94, 0.3)",
        },
      },
      boxShadow: {
        "neon-cyan": "0 0 20px -3px rgba(6, 182, 212, 0.4)",
        "neon-pass": "0 0 20px -3px rgba(16, 185, 129, 0.4)",
        "neon-review": "0 0 20px -3px rgba(245, 158, 11, 0.4)",
        "neon-flag": "0 0 20px -3px rgba(244, 63, 94, 0.4)",
        "glass": "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};
export default config;
