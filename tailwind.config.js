/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef4ff",
          100: "#dbe6ff",
          200: "#bccfff",
          300: "#8eaeff",
          400: "#5a82ff",
          500: "#345bff",
          600: "#1d3bf5",
          700: "#162ce1",
          800: "#1827b6",
          900: "#1b288f",
        },
      },
      boxShadow: {
        card: "0 1px 2px rgba(16,24,40,0.06), 0 1px 3px rgba(16,24,40,0.10)",
        cardhover: "0 4px 12px rgba(16,24,40,0.10), 0 2px 6px rgba(16,24,40,0.08)",
      },
    },
  },
  plugins: [],
};
