/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        purpledark: "#291E2A",
        orangeaccent: "#FF4500",
        orangedark: "#CC3600",
        foreground: "#EBEBEB",
      },
    },
  },
  plugins: [],
};
