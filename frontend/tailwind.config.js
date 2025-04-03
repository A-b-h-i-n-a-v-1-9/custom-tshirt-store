/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class", 
  theme: {
    extend: {
      colors: {
        primary: "#1F2937", // Dark gray
        secondary: "#EAB308", // Yellow
        accent: "#6366F1", // Blue
      },
    },
  },
  plugins: [],
};
