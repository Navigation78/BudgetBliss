/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // The palette actually used across the app (Home/Analytics/CreateBudget/
        // Profile/TipsAndStreaks/Navbar) - previously repeated as raw hex in every
        // screen instead of living here.
        ink: '#04080F',
        primary: '#3E68A3',
        accent: '#A1C6EA',
        pale: '#E0E9F6',
      },
      fontFamily: {
        nunito: ["'Nunito Sans'", "sans-serif"],
      },
    },
  },
  plugins: [],
};
