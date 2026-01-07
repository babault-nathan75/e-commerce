/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,jsx}",
    "./src/components/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          orange: "#F97316",
          green: "#16A34A",
          yellow: "#FACC15"
        }
      },
      // --- AJOUT DES ANIMATIONS PÉTILLANTES ---
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
      }
    }
  },
  plugins: []
};