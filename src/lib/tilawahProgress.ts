/** Kemajuan Tilawah per perangkat: terakhir dibaca, ayat dibaca hari ini, target harian, hari berturut-turut. */
export const TOTAL_AYAH = 6236;
export const TOTAL_PAGES = 604;
export const AYAH_PER_PAGE = TOTAL_AYAH / TOTAL_PAGES;
import { useEffect } from "react";
import { api, getToken } from "./api";

const KEY = "hafiz_tilawah_v1";
/** Tiap akun (anak atau orang tua) punya penyimpanan sendiri di perangkat, dan disinkronkan ke server. */
function storeKey() {
  try {
    const t = getToken();
    if (t) {
      const p = JSON.parse(atob(t.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
      const id = p.member_id || p.sub;
      if (id) return `${KEY}:${id}`;
    }
  } catch { /* abaikan */ }
  return KEY;
}

export type TilawahState = {
  last?: { surah: number; ayah: number; at?: number };
  bookmark?: { surah: number; ayah: number; at?: number }; // penanda ayat terakhir yang dipilih sendiri
  bookmark_cleared_at?: number;
  target_at?: number;
  target: number; // halaman per hari
  days: Record<string, string[]>; // yyyy-mm-dd -> "surah:ayah" unik
  max?: number; // posisi terjauh (ayat ke-n dari 6236)
};

export const dayKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export function loadTilawah(defaultTarget = 1): TilawahState {
  try {
    const raw = localStorage.getItem(storeKey()) ?? localStorage.getItem(KEY);
    if (raw) return { target: defaultTarget, days: {}, ...JSON.parse(raw) };
  } catch { /* abaikan */ }
  return { target: defaultTarget, days: {} };
}
let pushTimer: ReturnType<typeof setTimeout> | undefined;
function schedulePush() {
  clearTimeout(pushTimer);
  pushTimer = setTimeout(() => { void pushTilawah(); }, 1200);
}
function save(s: TilawahState, push = true) {
  try {
    const keys = Object.keys(s.days).sort().slice(-60);
    s.days = Object.fromEntries(keys.map((k) => [k, s.days[k]]));
    localStorage.setItem(storeKey(), JSON.stringify(s));
    window.dispatchEvent(new Event("hafiz_tilawah_changed"));
  } catch { /* abaikan */ }
  if (push) schedulePush();
}

type Remote = Partial<TilawahState>;
/** Gabungkan dua salinan: yang lebih baru menang untuk penanda/terakhir/target, hari baca digabung. */
export function mergeTilawah(a: Remote, b: Remote): Remote {
  const out: Remote = { ...a };
  out.last = [a.last, b.last].filter(Boolean).sort((x, y) => (y!.at ?? 0) - (x!.at ?? 0))[0];
  const cleared = Math.max(a.bookmark_cleared_at ?? 0, b.bookmark_cleared_at ?? 0);
  const bm = [a.bookmark, b.bookmark].filter(Boolean).sort((x, y) => (y!.at ?? 0) - (x!.at ?? 0))[0];
  out.bookmark_cleared_at = cleared;
  out.bookmark = bm && (bm.at ?? 0) > cleared ? bm : undefined;
  if ((b.target_at ?? 0) > (a.target_at ?? 0) && b.target != null) { out.target = b.target; out.target_at = b.target_at; }
  const days: Record<string, Set<string>> = {};
  for (const src of [a.days ?? {}, b.days ?? {}]) for (const [k, v] of Object.entries(src)) { days[k] ??= new Set(); v.forEach((x) => days[k].add(x)); }
  out.days = Object.fromEntries(Object.keys(days).sort().slice(-60).map((k) => [k, [...days[k]]]));
  out.max = Math.max(a.max ?? 0, b.max ?? 0);
  return out;
}
const body = (s: TilawahState) => ({ last: s.last ?? null, bookmark: s.bookmark ?? null, bookmark_cleared_at: s.bookmark_cleared_at ?? 0, target: s.target, target_at: s.target_at ?? 0, days: s.days, max: s.max ?? 0 });
export async function pushTilawah() {
  if (!getToken()) return;
  try { await api("/tilawah", { method: "PUT", body: JSON.stringify(body(loadTilawah())) }); } catch { /* offline: dicoba lagi saat berikutnya */ }
}
/** Ambil dari server, gabungkan dengan salinan di perangkat ini, simpan, lalu kirim hasil gabungan. */
export async function syncTilawah() {
  if (!getToken()) return;
  try {
    const remote = await api<Remote>("/tilawah");
    const local = loadTilawah();
    const merged = { ...local, ...mergeTilawah(local, remote) } as TilawahState;
    if (remote.target != null && (remote.target_at ?? 0) > (local.target_at ?? 0)) merged.target = remote.target;
    save(merged, false);
    await api("/tilawah", { method: "PUT", body: JSON.stringify(body(merged)) });
  } catch { /* offline atau belum masuk */ }
}
/** Panggil di halaman Tilawah: sinkron saat dibuka dan saat kembali ke aplikasi. */
export function useTilawahSync() {
  useEffect(() => {
    void syncTilawah();
    const f = () => { if (document.visibilityState === "visible") void syncTilawah(); };
    document.addEventListener("visibilitychange", f);
    return () => document.removeEventListener("visibilitychange", f);
  }, []);
}
/** offset = jumlah ayat di semua surat sebelum surat ini. */
export function recordAyah(surah: number, ayah: number, offset: number) {
  const s = loadTilawah();
  s.last = { surah, ayah, at: Date.now() };
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
  if (s.bookmark?.surah === surah && s.bookmark.ayah === ayah) { delete s.bookmark; s.bookmark_cleared_at = Date.now(); }
  else s.bookmark = { surah, ayah, at: Date.now() };
  save(s);
}
/** Posisi untuk melanjutkan: penanda jika ada, kalau tidak ayat terakhir diputar. */
export const resumePoint = (s: TilawahState) => s.bookmark ?? s.last;
export function setTarget(pages: number) { const s = loadTilawah(); s.target = pages; s.target_at = Date.now(); save(s); }
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
