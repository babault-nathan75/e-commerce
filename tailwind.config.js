/** @type {import('tailwindcss').Config} */
import headlessui from "@headlessui/tailwindcss";

export default {
  content: [
    "./src/app/**/*.{js,jsx}",
    "./src/components/**/*.{js,jsx}",
    // --- PROTOCOLE TREMOR ---
    "./node_modules/@tremor/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    transparent: "transparent",
    current: "currentColor",
    extend: {
      colors: {
        brand: {
          orange: "#F97316",
          green: "#16A34A",
          yellow: "#FACC15",
          navy: "#232f3e",
        },
        // --- CONFIGURATION TREMOR ---
        tremor: {
          brand: {
            faint: "#fff7ed",
            muted: "#ffedd5",
            subtle: "#fdba74",
            DEFAULT: "#F97316",
            emphasis: "#ea580c",
            inverted: "#ffffff",
          },
          background: {
            muted: "#f8fafc",
            subtle: "#f1f5f9",
            DEFAULT: "#ffffff",
            emphasis: "#232f3e",
          },
          border: {
            DEFAULT: "#e2e8f0",
          },
          ring: {
            DEFAULT: "#e2e8f0",
          },
          content: {
            subtle: "#94a3b8",
            DEFAULT: "#64748b",
            emphasis: "#232f3e",
            strong: "#0f172a",
            inverted: "#ffffff",
          },
        },
      },
      keyframes: {
        sparkle: {
          '0%, 100%': { 'background-position': '0% 50%' },
          '50%': { 'background-position': '100% 50%' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        }
      },
      animation: {
        'sparkle-move': 'sparkle 3s ease infinite',
        'shimmer': 'shimmer 2s infinite',
      },
      borderRadius: {
        "tremor-small": "0.375rem",
        "tremor-default": "1.5rem",
        "tremor-full": "9999px",
      },
      boxShadow: {
        "tremor-card": "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
      }
    }
  },
  safelist: [
    {
      pattern: /^(bg-(?:tremor|(?:neutral|orange|emerald|blue|red))-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
      variants: ["hover", "ui-selected"],
    },
    {
      pattern: /^(text-(?:tremor|(?:neutral|orange|emerald|blue|red))-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
      variants: ["hover", "ui-selected"],
    },
    {
      pattern: /^(border-(?:tremor|(?:neutral|orange|emerald|blue|red))-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
      variants: ["hover", "ui-selected"],
    },
  ],
  plugins: [headlessui]
};