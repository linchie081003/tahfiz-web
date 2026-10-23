/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        outline: "#1F2A28",
        line: "#E6E4F8",
        lav: "#E6E4F8",
        teal: { DEFAULT: "#0F766E", dark: "#0B5C56" },
        gold: { DEFAULT: "#F2B01E", ink: "#412402" },
        coral: "#F26B3A",
        cream: "#FFF1C9",
        muted: "#5B6B67",
        brand: {
          DEFAULT: "#4F46B5",
          dark: "#3C3489",
          light: "#F4F3FD",
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
          green: { start: "#0F766E", end: "#0F766E" },
          gold: { start: "#F2B01E", end: "#F2B01E" },
          orange: "#FFB020",
          blue: "#4DB8FF",
          coral: "#F26B3A",
          cheek: "#FF8FA3",
          locked: "#E6E4F8",
        },
        primary: "#4F46B5",
        cta: "#4F46B5",
      },
      fontFamily: {
        sans: ["Nunito", "Amiri Quran", "system-ui", "sans-serif"],
        quran: ["Amiri Quran", "Scheherazade New", "Traditional Arabic", "serif"],
      },
      borderRadius: {
        card: "24px",
        game: "26px",
        pill: "999px",
      },
      boxShadow: {
        game: "none",
        "game-sm": "none",
        "game-press": "none",
      },
      maxWidth: {
        game: "480px",
      },
    },
  },
  plugins: [],
};
