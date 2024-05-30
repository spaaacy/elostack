/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // foregrounddark: "#EBEBEB",
        // backgrounddark: "#291E2A",
        backgroundlight: "#EBEBEB",
        foregrounddark: "#EBEBEB",
        backgrounddark: "#291E2A",
        primary: "#E63D00",
        primarydark: "#CC3600",
      },
    },
  },
  plugins: [],
};
