/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        'soft-blue': '#c4d5ecff',
        'sky-blue': '#da91ddff',
        'royal-blue': '#1d0f6aff',
        'midnight-blue': '#8a7ee4ff',
      },
      fontFamily: {
        nunito: ["'Nunito Sans'", "sans-serif"],
      },
    },
  },
  plugins: [],
};
