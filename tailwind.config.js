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
      }
    }
  },
  plugins: []
};