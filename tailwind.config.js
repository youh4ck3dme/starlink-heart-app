/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'deep-space': '#0f172a', // Placeholder or custom colors if needed
      },
      fontFamily: {
        display: ['Inter', 'sans-serif'], // Or existing font
      }
    },
  },
  plugins: [],
}
