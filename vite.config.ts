import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "Hafiz — Misi Hafalan Qur'an",
        short_name: "Hafiz",
        theme_color: "#4A27B0",
        background_color: "#4A27B0",
        display: "standalone",
        start_url: "/",
        icons: [],
      },
    }),
  ],
  server: { port: 5175 },
});
