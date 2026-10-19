import type { AgeMode } from "../context/AgeModeContext";
import type { ReciterOption } from "./reciters";
import { loadQuranPrefs, saveQuranPrefs, type QuranPrefs } from "./quranPrefs";

const DEFAULT_BY_AGE: Record<AgeMode, string> = {
  paud: "husary_muallim",
  sd: "husary_muallim",
  teen: "husary",
  adult: "husary",
};

const SETTINGS_ORDER: Record<AgeMode, string[]> = {
  paud: ["husary_muallim", "husary", "minshawi", "alafasy", "saad", "yasser", "salah_budair"],
  sd: ["husary_muallim", "husary", "minshawi", "alafasy", "saad", "sudais", "yasser", "salah_budair", "ayyoub"],
  teen: ["husary", "minshawi", "alafasy", "saad", "sudais", "yasser", "salah_budair", "ayyoub"],
  adult: ["husary", "minshawi", "alafasy", "saad", "sudais", "yasser", "salah_budair", "ayyoub"],
};

export function defaultReciterForAge(mode: AgeMode): string {
  return DEFAULT_BY_AGE[mode] ?? DEFAULT_BY_AGE.sd;
}

export function filterRecitersForAge(all: ReciterOption[], mode: AgeMode): ReciterOption[] {
  const allowed = new Set(SETTINGS_ORDER[mode] ?? SETTINGS_ORDER.sd);
  const filtered = all.filter((r) => allowed.has(r.id) && r.style !== "mujawwad");
  if (!filtered.length) return all.filter((r) => r.style !== "mujawwad");
  const order = SETTINGS_ORDER[mode] ?? SETTINGS_ORDER.sd;
  return [...filtered].sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
}

export function ensureLearningReciter(prefs: QuranPrefs, mode: AgeMode): QuranPrefs {
  const allowed = new Set(SETTINGS_ORDER[mode] ?? SETTINGS_ORDER.sd);
  const fallback = defaultReciterForAge(mode);
  if (prefs.reciterId.includes("mujawwad") || !allowed.has(prefs.reciterId)) {
    const next = { ...prefs, reciterId: fallback };
    saveQuranPrefs(next);
    return next;
  }
  return prefs;
}

/** Saat ganti profil: qari mengikuti mode usia (default atau pilihan yang masih diizinkan). */
export function syncReciterToAgeMode(mode: AgeMode) {
  const prefs = loadQuranPrefs();
  const allowed = new Set(SETTINGS_ORDER[mode] ?? SETTINGS_ORDER.sd);
  let nextId = prefs.reciterId;
  if (!allowed.has(nextId) || nextId.includes("mujawwad")) {
    nextId = defaultReciterForAge(mode);
  }
  if (nextId !== prefs.reciterId) saveQuranPrefs({ ...prefs, reciterId: nextId });
}

const BEAUTY_SEEN_KEY = "hafiz_beauty_seen";

export function markBeautyRewardSeen(submissionId: string) {
  try {
    const raw = localStorage.getItem(BEAUTY_SEEN_KEY);
    const ids: string[] = raw ? JSON.parse(raw) : [];
    if (!ids.includes(submissionId)) {
      ids.push(submissionId);
      if (ids.length > 30) ids.shift();
      localStorage.setItem(BEAUTY_SEEN_KEY, JSON.stringify(ids));
    }
  } catch {
    localStorage.setItem(BEAUTY_SEEN_KEY, JSON.stringify([submissionId]));
  }
}

export function isBeautyRewardSeen(submissionId: string): boolean {
  try {
    const raw = localStorage.getItem(BEAUTY_SEEN_KEY);
    const ids: string[] = raw ? JSON.parse(raw) : [];
    return ids.includes(submissionId);
  } catch {
    return false;
  }
}
