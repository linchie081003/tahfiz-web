/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#4A27B0",
        cta: "#4CAF50",
        menu: {
          tahsin: "#4CAF50",
          ziyadah: "#2196F3",
          murojaah: "#FF9800",
          ujian: "#9E9E9E",
          peta: "#009688",
          lencana: "#FFC107",
          referensi: "#9C27B0",
          laporan: "#F44336",
          settings: "#616161",
        },
      },
      fontFamily: {
        sans: ["Nunito", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
