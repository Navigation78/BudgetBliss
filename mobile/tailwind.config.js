/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.js", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Shared BudgetBliss brand palette.
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
