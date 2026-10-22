/** Kemajuan Tilawah per perangkat: terakhir dibaca, ayat dibaca hari ini, target harian, hari berturut-turut. */
export const TOTAL_AYAH = 6236;
export const TOTAL_PAGES = 604;
export const AYAH_PER_PAGE = TOTAL_AYAH / TOTAL_PAGES;
const KEY = "hafiz_tilawah_v1";

export type TilawahState = {
  last?: { surah: number; ayah: number };
  bookmark?: { surah: number; ayah: number }; // penanda ayat terakhir yang dipilih sendiri
  target: number; // halaman per hari
  days: Record<string, string[]>; // yyyy-mm-dd -> "surah:ayah" unik
  max?: number; // posisi terjauh (ayat ke-n dari 6236)
};

export const dayKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export function loadTilawah(defaultTarget = 1): TilawahState {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { target: defaultTarget, days: {}, ...JSON.parse(raw) };
  } catch { /* abaikan */ }
  return { target: defaultTarget, days: {} };
}
function save(s: TilawahState) {
  try {
    const keys = Object.keys(s.days).sort().slice(-60);
    s.days = Object.fromEntries(keys.map((k) => [k, s.days[k]]));
    localStorage.setItem(KEY, JSON.stringify(s));
    window.dispatchEvent(new Event("hafiz_tilawah_changed"));
  } catch { /* abaikan */ }
}
/** offset = jumlah ayat di semua surat sebelum surat ini. */
export function recordAyah(surah: number, ayah: number, offset: number) {
  const s = loadTilawah();
  s.last = { surah, ayah };
  const k = dayKey();
  const set = new Set(s.days[k] ?? []);
  set.add(`${surah}:${ayah}`);
  s.days[k] = [...set];
  s.max = Math.max(s.max ?? 0, offset + ayah);
  save(s);
}
/** Tandai ayat terakhir; menandai ayat yang sama sekali lagi melepas tandanya. */
export function toggleBookmark(surah: number, ayah: number) {
  const s = loadTilawah();
  if (s.bookmark?.surah === surah && s.bookmark.ayah === ayah) delete s.bookmark;
  else s.bookmark = { surah, ayah };
  save(s);
}
/** Posisi untuk melanjutkan: penanda jika ada, kalau tidak ayat terakhir diputar. */
export const resumePoint = (s: TilawahState) => s.bookmark ?? s.last;
export function setTarget(pages: number) { const s = loadTilawah(); s.target = pages; save(s); }
export const pagesRead = (s: TilawahState, key = dayKey()) => (s.days[key]?.length ?? 0) / AYAH_PER_PAGE;
export function streak(s: TilawahState) {
  let n = 0; const d = new Date();
  if (!s.days[dayKey(d)]?.length) d.setDate(d.getDate() - 1);
  while (s.days[dayKey(d)]?.length) { n++; d.setDate(d.getDate() - 1); }
  return n;
}
/** 7 hari Senin..Minggu minggu ini: apakah ada bacaan. */
export function weekDots(s: TilawahState) {
  const now = new Date(); const mon = new Date(now); mon.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  return ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"].map((label, i) => {
    const d = new Date(mon); d.setDate(mon.getDate() + i);
    const key = dayKey(d);
    return { label, done: (s.days[key]?.length ?? 0) > 0, today: key === dayKey(now) };
  });
}
