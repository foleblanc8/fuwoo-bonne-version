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
        fuwoo: {
          primary: "#FF5A5F",
          secondary: "#00A699",
          accent: "#FC642D",
          background: "#F7F7F7",
          text: "#484848",
        },
      },
    },
  },
  plugins: [],
}