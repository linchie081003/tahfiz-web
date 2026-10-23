import { useSyncExternalStore } from "react";

export type QuranPrefs = {
  reciterId: string;
  playbackSpeed: number;
  arabicFontSize: "medium" | "large" | "xlarge";
  showTajweed: boolean;
  voiceGender: "all" | "male" | "female";
  tilawahReciterId?: string; // qari khusus mendengarkan Tilawah ("" = ikut qari belajar)
  tilawahMaqam?: "" | "rast" | "bayati"; // saringan irama pada daftar qari Tilawah
};

const KEY = "hafiz_quran_prefs";
export const QURAN_PREFS_EVENT = "hafiz_quran_prefs_changed";

export const defaultPrefs: QuranPrefs = {
  reciterId: "husary_muallim",
  playbackSpeed: 1,
  arabicFontSize: "large",
  showTajweed: true,
  voiceGender: "all",
  tilawahReciterId: "",
  tilawahMaqam: "",
};

let snapshotCache: { raw: string; value: QuranPrefs } | null = null;

export function loadQuranPrefs(): QuranPrefs {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...defaultPrefs };
    return { ...defaultPrefs, ...JSON.parse(raw) };
  } catch {
    return { ...defaultPrefs };
  }
}

function readPrefsSnapshot(): QuranPrefs {
  if (typeof window === "undefined") return { ...defaultPrefs };
  const raw = window.localStorage.getItem(KEY) ?? "";
  if (snapshotCache?.raw === raw) return snapshotCache.value;
  const value = loadQuranPrefs();
  snapshotCache = { raw, value };
  return value;
}

function subscribePrefs(cb: () => void) {
  const onChange = () => {
    snapshotCache = null;
    cb();
  };
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) onChange();
  };
  window.addEventListener(QURAN_PREFS_EVENT, onChange);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(QURAN_PREFS_EVENT, onChange);
    window.removeEventListener("storage", onStorage);
  };
}

export function useQuranPrefs(): QuranPrefs {
  return useSyncExternalStore(subscribePrefs, readPrefsSnapshot, () => ({ ...defaultPrefs }));
}

export function saveQuranPrefs(prefs: QuranPrefs) {
  localStorage.setItem(KEY, JSON.stringify(prefs));
  snapshotCache = null;
  window.dispatchEvent(new Event(QURAN_PREFS_EVENT));
}
