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
        theme_color: "#4DB8FF",
        background_color: "#9EDFFF",
        display: "standalone",
        start_url: "/",
        icons: [
          {
            src: "/icons/mascot-pwa.svg",
            sizes: "192x192",
            type: "image/svg+xml",
            purpose: "any",
          },
          {
            src: "/icons/mascot-pwa.svg",
            sizes: "512x512",
            type: "image/svg+xml",
            purpose: "any",
          },
          {
            src: "/icons/mascot-pwa.svg",
            sizes: "512x512",
            type: "image/svg+xml",
            purpose: "maskable",
          },
        ],
      },
    }),
  ],
  server: { port: 5175 },
});
