import type { ReactNode } from "react";

const O = "#2B1B5E";

type P = { size?: number; className?: string };

function Svg({ size = 28, children }: P & { children: ReactNode }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden className="shrink-0">
      {children}
    </svg>
  );
}

function IconMoon(p: P) {
  return (
    <Svg {...p}>
      <path d="M30 10a14 14 0 1 0 0 28 16 16 0 0 1 0-28z" fill="#EFEBFF" stroke={O} strokeWidth="2.5" />
    </Svg>
  );
}
function IconSun(p: P) {
  return (
    <Svg {...p}>
      <circle cx="24" cy="24" r="10" fill="#FFC933" stroke={O} strokeWidth="2.5" />
      <path d="M24 6v6M24 36v6M6 24h6M36 24h6" stroke={O} strokeWidth="2.5" strokeLinecap="round" />
    </Svg>
  );
}
function IconLamp(p: P) {
  return (
    <Svg {...p}>
      <path d="M18 38h12M20 38V28c-4-2-6-6-6-10a10 10 0 1 1 20 0c0 4-2 8-6 10v10" fill="#FFB020" stroke={O} strokeWidth="2.5" />
    </Svg>
  );
}
function IconHands(p: P) {
  return (
    <Svg {...p}>
      <path d="M14 32V18l6 4V14l8 6v12H14z" fill="#8CF07A" stroke={O} strokeWidth="2.5" strokeLinejoin="round" />
    </Svg>
  );
}
function IconMountain(p: P) {
  return (
    <Svg {...p}>
      <path d="M8 38 24 12l16 26H8z" fill="#5CCB4E" stroke={O} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M20 38 28 22l10 16" fill="#8BE36B" stroke={O} strokeWidth="2" />
    </Svg>
  );
}
function IconPearl(p: P) {
  return (
    <Svg {...p}>
      <circle cx="24" cy="26" r="12" fill="#D8F4FF" stroke={O} strokeWidth="2.5" />
      <ellipse cx="20" cy="22" rx="4" ry="2" fill="white" opacity="0.7" />
    </Svg>
  );
}
function IconBird(p: P) {
  return (
    <Svg {...p}>
      <path d="M10 28c8-8 20-8 28 0-6 4-12 6-14 6s-8-2-14-6z" fill="#4DB8FF" stroke={O} strokeWidth="2.5" />
      <circle cx="32" cy="22" r="3" fill={O} />
    </Svg>
  );
}
function IconHeart(p: P) {
  return (
    <Svg {...p}>
      <path d="M24 38S8 26 8 18a8 8 0 0 1 16 0 8 8 0 0 1 16 0c0 8-16 20-16 20z" fill="#FF8FA3" stroke={O} strokeWidth="2.5" />
    </Svg>
  );
}
function IconBook(p: P) {
  return (
    <Svg {...p}>
      <path d="M12 10h12a8 8 0 0 1 8 8v22H12V10z" fill="#4DB8FF" stroke={O} strokeWidth="2.5" />
      <path d="M24 10v30M12 18h20" stroke={O} strokeWidth="2" />
    </Svg>
  );
}
function IconFlame(p: P) {
  return (
    <Svg {...p}>
      <path d="M24 8c0 8-8 10-8 18a8 8 0 0 0 16 0c0-8-8-10-8-18z" fill="#FF7A59" stroke={O} strokeWidth="2.5" />
    </Svg>
  );
}
function IconDrop(p: P) {
  return (
    <Svg {...p}>
      <path d="M24 8c8 12 12 18 12 26a12 12 0 0 1-24 0c0-8 4-14 12-26z" fill="#4DB8FF" stroke={O} strokeWidth="2.5" />
    </Svg>
  );
}
function IconCrown(p: P) {
  return (
    <Svg {...p}>
      <path d="M10 34h28l-4-18-6 10-4-14-4 14-6-10-4 18z" fill="#FFC933" stroke={O} strokeWidth="2.5" strokeLinejoin="round" />
    </Svg>
  );
}

const ICONS = [IconMoon, IconSun, IconLamp, IconHands, IconMountain, IconPearl, IconBird, IconHeart, IconBook, IconFlame, IconDrop, IconCrown] as const;

/** Ikon dekoratif per surah — konsisten per nomor surat. */
export function PetaSurahIcon({ surahId, size = 26 }: { surahId: number; size?: number }) {
  const idx = (surahId * 5 + 11) % ICONS.length;
  const C = ICONS[idx]!;
  return <C size={size} />;
}

export function petaNodeAccent(surahId: number): string {
  const accents = [
    "from-game-blue to-brand-light",
    "from-game-green-start to-game-green-end",
    "from-game-gold-start to-game-gold-end",
    "from-game-coral/80 to-game-orange",
    "from-brand-light to-game-blue",
  ];
  return accents[surahId % accents.length]!;
}
