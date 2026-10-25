import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        soil: {
          dark: "#4E342E",
          DEFAULT: "#6D4C41",
          light: "#8D6E63",
          bg: "#EFEBE9",
        },
        agri: {
          green: "#2E7D32",
          "green-dark": "#1B5E20",
          "green-light": "#4CAF50",
          yellow: "#F9A825",
          "yellow-dark": "#F57F17",
          "yellow-light": "#FFF9C4",
          bg: "#FAF7F0",
          card: "#FFFFFF",
          border: "#E0DCD3",
          text: "#1C1C1A",
          muted: "#6B6960",
          danger: "#D32F2F",
          warning: "#ED6C02",
          success: "#2E7D32",
        },
      },
      fontFamily: {
        sans: [
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "'Segoe UI'",
          "Roboto",
          "sans-serif",
        ],
      },
      boxShadow: {
        soft: "0 4px 20px -2px rgba(46, 125, 50, 0.08), 0 2px 6px -1px rgba(0, 0, 0, 0.04)",
        card: "0 2px 12px rgba(109, 76, 65, 0.08)",
        elevated: "0 10px 30px rgba(46, 125, 50, 0.15)",
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
        "3xl": "1.75rem",
      },
    },
  },
  plugins: [],
};

export default config;
