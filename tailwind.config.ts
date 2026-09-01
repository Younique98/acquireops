import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "media",
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: "var(--surface-1)",
        plane: "var(--page-plane)",
        ink: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          muted: "var(--text-muted)",
        },
        line: {
          grid: "var(--gridline)",
          axis: "var(--baseline)",
          border: "var(--border)",
        },
        brand: {
          100: "var(--blue-100)",
          150: "var(--blue-150)",
          200: "var(--blue-200)",
          250: "var(--blue-250)",
          300: "var(--blue-300)",
          350: "var(--blue-350)",
          400: "var(--blue-400)",
          450: "var(--blue-450)",
          500: "var(--blue-500)",
          550: "var(--blue-550)",
          600: "var(--blue-600)",
          // Theme-aware: for TEXT (wordmark, links) on the page background.
          // The numbered steps stay static Tailwind values for solid
          // button/badge fills, which don't need to shift with theme.
          text: "var(--brand-text)",
        },
        status: {
          good: "var(--status-good)",
          goodText: "var(--status-good-text)",
          warning: "var(--status-warning)",
          serious: "var(--status-serious)",
          critical: "var(--status-critical)",
          criticalText: "var(--status-critical-text)",
        },
      },
      fontFamily: {
        sans: ["system-ui", "-apple-system", "Segoe UI", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
