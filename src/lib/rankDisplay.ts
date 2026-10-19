import type { AgeMode } from "../context/AgeModeContext";
import { ageModeLabel } from "./ageModeOptions";

/** Judul level dari backend → label ramah anak/orang tua per mode usia. */
const RANK_BY_TITLE: Record<string, Record<AgeMode, string>> = {
  "Santri Pemula": {
    paud: "Bintang PAUD",
    sd: "Pejuang Kelas",
    teen: "Pemula hafalan",
    adult: "Tahap awal",
  },
  "Penghafal Juz Amma": {
    paud: "Penghafal kecil",
    sd: "Juara Juz Amma",
    teen: "Penghafal Juz Amma",
    adult: "Progres Juz Amma",
  },
  "Hafizh Muda": {
    paud: "Hafiz cilik",
    sd: "Hafizh Muda",
    teen: "Hafizh muda",
    adult: "Hafizh aktif",
  },
  "Hafizh 30 Juz": {
    paud: "Bintang hafalan",
    sd: "Bintang sekolah",
    teen: "Penghafal hebat",
    adult: "Hafizh 30 juz",
  },
};

const RANK_EMOJI: Record<AgeMode, string[]> = {
  paud: ["🌟", "🎈", "🌈", "🏆"],
  sd: ["⭐", "📿", "🎯", "🏅"],
  teen: ["✨", "📖", "🔥", "💫"],
  adult: ["◆", "▸", "●", "★"],
};

export function homeGreeting(name: string, mode: AgeMode): string {
  switch (mode) {
    case "paud":
      return `Hai, ${name}!`;
    case "sd":
      return `Halo, ${name}!`;
    case "teen":
      return `Assalamualaikum, ${name}`;
    default:
      return `Halo, ${name}`;
  }
}

export function formatRankTitle(rankTitle: string, level: number, mode: AgeMode): string {
  const mapped = RANK_BY_TITLE[rankTitle]?.[mode];
  if (mapped) return mapped;
  return mode === "adult" || mode === "teen" ? rankTitle : `${rankTitle}`;
}

export function rankEmoji(level: number, mode: AgeMode): string {
  const list = RANK_EMOJI[mode];
  const idx = Math.min(Math.max(Math.floor((level - 1) / 3), 0), list.length - 1);
  return list[idx] ?? "⭐";
}

export function modeBadgeLabel(mode: AgeMode): string {
  return ageModeLabel(mode);
}

export const modeBadgeClass: Record<AgeMode, string> = {
  paud: "border-game-coral/60 bg-gradient-to-r from-game-coral/30 to-white",
  sd: "border-brand/50 bg-gradient-to-r from-brand-light to-white",
  teen: "border-game-blue/50 bg-gradient-to-r from-game-blue/30 to-white",
  adult: "border-outline/30 bg-white/90",
};
