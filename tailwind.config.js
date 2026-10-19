/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        outline: "#2B1B5E",
        brand: {
          DEFAULT: "#4B2FC0",
          dark: "#3A22A3",
          light: "#EFEBFF",
        },
        sky: {
          top: "#4DB8FF",
          mid: "#9EDFFF",
          bottom: "#D8F4FF",
        },
        hill: {
          light: "#8BE36B",
          dark: "#5CCB4E",
        },
        game: {
          green: { start: "#8CF07A", end: "#2FBF71" },
          gold: { start: "#FFF3A0", end: "#FFC933" },
          orange: "#FFB020",
          blue: "#4DB8FF",
          coral: "#FF7A59",
          cheek: "#FF8FA3",
          locked: "#BFC4D0",
        },
        primary: "#4B2FC0",
        cta: "#2FBF71",
      },
      fontFamily: {
        sans: ["Switzer", "Hanken Grotesk", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "18px",
        game: "10px",
        pill: "999px",
      },
      boxShadow: {
        game: "0 4px 0 #2B1B5E",
        "game-sm": "0 3px 0 #2B1B5E",
        "game-press": "0 1px 0 #2B1B5E",
      },
      maxWidth: {
        game: "480px",
      },
    },
  },
  plugins: [],
};
