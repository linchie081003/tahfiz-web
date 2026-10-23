import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => {
  if (mode === "production") {
    const base = loadEnv(mode, process.cwd(), "VITE_").VITE_API_BASE?.trim() ?? "";
    if (!/^https:\/\//i.test(base) || /localhost|127\.0\.0\.1|0\.0\.0\.0/i.test(base)) {
      throw new Error(
        `VITE_API_BASE untuk build produksi harus URL https backend yang di-host (bukan localhost). Nilai sekarang: "${base || "(kosong)"}". ` +
          "Set di environment build, contoh: VITE_API_BASE=https://tahfiz-api.onrender.com npm run build",
      );
    }
  }
  return {
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      workbox: { importScripts: ["/push-sw.js"] },
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
  };
});
