export type StatusKind = "tahsin" | "journey";

type Tone = "success" | "info" | "wait" | "warn" | "muted";

type StatusMeta = {
  label: string;
  shortLabel: string;
  tone: Tone;
  emoji: string;
};

const TAHsin: Record<string, StatusMeta> = {
  not_started: {
    label: "Belum mulai tahsin",
    shortLabel: "Belum mulai",
    tone: "muted",
    emoji: "🌱",
  },
  pending_eval: {
    label: "Setoran tahsin menunggu dinilai",
    shortLabel: "Tunggu dinilai",
    tone: "wait",
    emoji: "⏳",
  },
  failed: {
    label: "Perlu latihan tahsin lagi",
    shortLabel: "Ulangi tahsin",
    tone: "warn",
    emoji: "💪",
  },
  passed: {
    label: "Sudah lulus tahsin",
    shortLabel: "Tahsin lulus",
    tone: "success",
    emoji: "⭐",
  },
};

const JOURNEY: Record<string, StatusMeta> = {
  locked: {
    label: "Surat ini belum terbuka",
    shortLabel: "Belum terbuka",
    tone: "muted",
    emoji: "🔒",
  },
  active: {
    label: "Surat sedang dipelajari",
    shortLabel: "Sedang belajar",
    tone: "info",
    emoji: "📖",
  },
  in_progress: {
    label: "Surat sedang dipelajari",
    shortLabel: "Sedang belajar",
    tone: "info",
    emoji: "📖",
  },
  needs_retry: {
    label: "Ulangi setoran surat ini",
    shortLabel: "Latihan lagi",
    tone: "warn",
    emoji: "🔄",
  },
  passed: {
    label: "Surat sudah lulus",
    shortLabel: "Sudah hafal",
    tone: "success",
    emoji: "✅",
  },
};

const FALLBACK: StatusMeta = {
  label: "Status belum diketahui",
  shortLabel: "—",
  tone: "muted",
  emoji: "·",
};

export function getStatusMeta(kind: StatusKind, code: string): StatusMeta {
  const table = kind === "tahsin" ? TAHsin : JOURNEY;
  return table[code] ?? FALLBACK;
}

export const statusToneClass: Record<Tone, string> = {
  success: "border-game-green-end/50 bg-gradient-to-r from-game-green-start/40 to-white text-outline",
  info: "border-brand/40 bg-gradient-to-r from-brand-light to-white text-outline",
  wait: "border-game-orange/50 bg-gradient-to-r from-game-gold-start/50 to-white text-outline",
  warn: "border-game-coral/50 bg-gradient-to-r from-game-coral/25 to-white text-outline",
  muted: "border-outline/25 bg-white/80 text-outline/80",
};
