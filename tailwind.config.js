/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f3f7ff",
          100: "#e2edff",
          500: "#4f46e5",
          600: "#4338ca",
        },
      },
    },
  },
  plugins: [],
};