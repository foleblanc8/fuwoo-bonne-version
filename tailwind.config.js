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
          primary: "#FF5A5F",
          secondary: "#00A699",
          accent: "#FC642D",
          background: "#F7F7F7",
          text: "#484848",
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