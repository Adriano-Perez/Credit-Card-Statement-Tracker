import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        base: {
          950: "#0A0A0F",
          900: "#0D0D13",
          800: "#15151D",
          700: "#1E1E28",
        },
        // Flat banking palette — every color is used as a solid fill,
        // never as a gradient stop. Meaning lives in which color is
        // used, not in blending between them.
        bank: {
          red: "#D1453B", // primary accent — buttons, links, brand
          green: "#2C7A4D", // safe balance
          gold: "#C9A84C", // new spending
          darkred: "#8B0000", // past due / penalty
          warn: "#FF6B6B", // alerts
        },
        ink: {
          primary: "#FFFFFF",
          secondary: "#8E8E93",
          muted: "#AEAEB2",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "16px",
        control: "12px",
        sheet: "28px",
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.35)",
      },
      animation: {
        "fade-up": "fadeUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) both",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
