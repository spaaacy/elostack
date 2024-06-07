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
        backgrounddark: "#0c0c0c",
        primary: "#E63D00",
        primarydark: "#CC3600",
      },
      dropShadow: {
        "3xl": "0 50px 50px rgba(0, 0, 0, 0.75)",
      },
    },
  },
  plugins: [],
};
