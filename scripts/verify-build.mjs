// Pastikan hasil build memakai URL backend yang benar (dipanggil setelah vite build).
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const base = (process.env.VITE_API_BASE || "").trim().replace(/\/+$/, "");
const dir = "dist/assets";
const js = readdirSync(dir).filter((f) => f.endsWith(".js")).map((f) => [f, readFileSync(join(dir, f), "utf8")]);
const bad = js.filter(([, t]) => /localhost:8010|127\.0\.0\.1:8010/.test(t)).map(([f]) => f);
if (bad.length) {
  console.error(`GAGAL: build masih memuat alamat localhost di ${bad.join(", ")}`);
  process.exit(1);
}
if (!js.some(([, t]) => t.includes(base))) {
  console.error(`GAGAL: URL backend ${base} tidak ditemukan di hasil build`);
  process.exit(1);
}
console.log(`OK: build memakai ${base}`);
