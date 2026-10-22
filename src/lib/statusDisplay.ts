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
  success: "border-teal/30 bg-teal/10 text-teal-dark",
  info: "border-brand/20 bg-brand-light text-brand-dark",
  wait: "border-gold/40 bg-cream text-gold-ink",
  warn: "border-coral/30 bg-coral/15 text-outline",
  muted: "border-line bg-lav/60 text-muted",
};
