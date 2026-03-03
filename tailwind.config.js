/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "app-bg": "#EBF4F8",
        "app-card": "#FFFFFF",
        "app-teal": "#2DD4A0",
        "app-teal-light": "#D0F5EB",
        "app-teal-dark": "#1BAF82",
        "app-blue": "#1E6FD9",
        "app-blue-light": "#DAEAF8",
        "app-navy": "#1A2332",
        "app-slate": "#6B7A8D",
        "app-border": "#E2EBF0",
        "app-red": "#F87171",
        "app-red-light": "#FEE2E2",
        "app-yellow": "#FBBF24",
        "app-yellow-light": "#FEF3C7",
        "app-green": "#34D399",
        "app-green-light": "#D1FAE5",
        "app-purple": "#A78BFA",
        "app-purple-light": "#EDE9FE",
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
