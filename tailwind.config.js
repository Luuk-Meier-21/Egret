/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    fontFamily: {
      sans: ["PT Sans", '"PT Sans"', "sans-serif"],
      serif: ["PT Serif", '"PT Serif"', "serif"],
    },
    extend: {
      colors: {
        gray: {
          400: "#292828",
          700: "#302D2B",
          800: "#1E1C1B",
          900: "#100F0F",
        },
        yellow: {
          400: "#FFD058",
          500: "#FFB800",
          600: "#FFA800",
          700: "#B46100",
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
