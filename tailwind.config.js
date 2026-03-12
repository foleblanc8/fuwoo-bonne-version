/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Geist Variable"', 'sans-serif'],
      },
      colors: {
        coupdemain: {
          primary: "#15803D",
          secondary: "#0E7490",
          accent: "#EA580C",
          background: "#F7FEF9",
          text: "#1C2B20",
        },
      },
      keyframes: {
        'slide-in': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'slide-in': 'slide-in 0.2s ease-out',
      },
    },
  },
  plugins: [],
}