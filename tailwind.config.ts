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
        bg: "var(--bg)",
        surface: "var(--surface)",
        "surface-2": "var(--surface-2)",
        line: "var(--border)",
        ink: {
          primary: "var(--ink-primary)",
          secondary: "var(--ink-secondary)",
          muted: "var(--ink-muted)",
        },
        navy: {
          DEFAULT: "var(--navy)",
          hover: "var(--navy-hover)",
          text: "var(--navy-text)",
        },
        status: {
          good: "var(--status-good)",
          goodText: "var(--status-good-text)",
          critical: "var(--status-critical)",
          criticalText: "var(--status-critical-text)",
          warning: "var(--status-warning)",
          warningText: "var(--status-warning-text)",
        },
      },
      fontFamily: {
        sans: ["var(--font-body)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "ui-serif", "Georgia", "serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
