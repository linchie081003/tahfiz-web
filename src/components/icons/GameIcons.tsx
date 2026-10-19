import type { ReactNode } from "react";

/** Ikon SVG orisinal — outline #2B1B5E, tanpa pustaka pihak ketiga */

const O = "#2B1B5E";

type P = { size?: number; className?: string; label?: string; decorative?: boolean };

function Svg({ size = 24, className, label, decorative, children }: P & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      className={className}
      role={decorative ? undefined : "img"}
      aria-hidden={decorative || !label}
      aria-label={label}
    >
      {children}
    </svg>
  );
}

export function IconTahsin(p: P) {
  return (
    <Svg {...p} label={p.label ?? "Tahsin"}>
      <circle cx="24" cy="24" r="18" fill="#8CF07A" stroke={O} strokeWidth="3" />
      <path d="M16 28c4-6 12-6 16 0" fill="none" stroke={O} strokeWidth="3" strokeLinecap="round" />
      <text x="24" y="22" textAnchor="middle" fontSize="14" fontWeight="800" fill={O}>
        ا
      </text>
    </Svg>
  );
}

export function IconZiyadah(p: P) {
  return (
    <Svg {...p} label={p.label ?? "Ziyadah"}>
      <rect x="10" y="8" width="28" height="32" rx="4" fill="#4DB8FF" stroke={O} strokeWidth="3" />
      <path d="M16 16h16M16 24h12M16 32h14" stroke={O} strokeWidth="3" strokeLinecap="round" />
    </Svg>
  );
}

export function IconMurojaah(p: P) {
  return (
    <Svg {...p} label={p.label ?? "Murojaah"}>
      <path
        d="M34 14a14 14 0 1 0 4 10"
        fill="none"
        stroke="#FFB020"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path d="M36 10v10h-10" fill="none" stroke={O} strokeWidth="3" strokeLinecap="round" />
    </Svg>
  );
}

export function IconUjian(p: P) {
  return (
    <Svg {...p} label={p.label ?? "Ujian"}>
      <path d="M24 6l6 12h12l-10 8 4 12-12-8-12 8 4-12-10-8h12z" fill="#FFC933" stroke={O} strokeWidth="3" />
    </Svg>
  );
}

export function IconUmmi(p: P) {
  return (
    <Svg {...p} label={p.label ?? "Ummi"}>
      <rect x="14" y="12" width="20" height="26" rx="3" fill="#EFEBFF" stroke={O} strokeWidth="3" />
      <path d="M18 18h12M18 24h8" stroke={O} strokeWidth="2.5" strokeLinecap="round" />
    </Svg>
  );
}

export function IconPeta(p: P) {
  return (
    <Svg {...p} label={p.label ?? "Perjalanan Juz Amma"}>
      <path d="M8 12l12-4 16 4v28l-16-4-12 4V12z" fill="#5CCB4E" stroke={O} strokeWidth="3" />
      <path d="M20 8v28M36 16v28" stroke={O} strokeWidth="2" />
    </Svg>
  );
}

export function IconLencana(p: P) {
  return (
    <Svg {...p} label={p.label ?? "Lencana"}>
      <circle cx="24" cy="20" r="12" fill="#FFC933" stroke={O} strokeWidth="3" />
      <path d="M16 32l8 10 8-10" fill="#FF7A59" stroke={O} strokeWidth="3" strokeLinejoin="round" />
    </Svg>
  );
}

export function IconLaporan(p: P) {
  return (
    <Svg {...p} label={p.label ?? "Laporan"}>
      <rect x="8" y="28" width="8" height="12" fill="#4DB8FF" stroke={O} strokeWidth="2" />
      <rect x="20" y="20" width="8" height="20" fill="#8CF07A" stroke={O} strokeWidth="2" />
      <rect x="32" y="12" width="8" height="28" fill="#FFB020" stroke={O} strokeWidth="2" />
    </Svg>
  );
}

export function IconHome(p: P) {
  return (
    <Svg {...p} label={p.label ?? "Home"}>
      <path
        d="M24 9 10 22v17h28V22L24 9z"
        fill="#8CF07A"
        stroke={O}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path d="M20 39V28h8v11" fill="#D8F4FF" stroke={O} strokeWidth="3" strokeLinejoin="round" />
    </Svg>
  );
}

export function IconLogout(p: P) {
  return (
    <Svg {...p} label={p.label ?? "Keluar"}>
      <path
        d="M18 8h8a4 4 0 0 1 4 4v16a4 4 0 0 1-4 4h-8"
        fill="none"
        stroke={O}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path d="M26 24H8M14 16l-6 8 6 8" fill="none" stroke={O} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function IconSettings(p: P) {
  return (
    <Svg {...p} label={p.label ?? "Pengaturan"}>
      <circle cx="24" cy="24" r="8" fill="#BFC4D0" stroke={O} strokeWidth="3" />
      <path
        d="M24 4v6M24 38v6M4 24h6M38 24h6M9 9l4 4M35 35l4 4M9 39l4-4M35 13l4-4"
        stroke={O}
        strokeWidth="3"
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function IconLock(p: P) {
  return (
    <Svg {...p} label={p.label ?? "Terkunci"} decorative={p.decorative}>
      <rect x="12" y="20" width="24" height="20" rx="4" fill="#BFC4D0" stroke={O} strokeWidth="3" />
      <path d="M16 20v-4a8 8 0 0 1 16 0v4" fill="none" stroke={O} strokeWidth="3" />
    </Svg>
  );
}

export function IconCheck(p: P) {
  return (
    <Svg {...p} label={p.label ?? "Selesai"} decorative={p.decorative}>
      <circle cx="24" cy="24" r="18" fill="#8CF07A" stroke={O} strokeWidth="3" />
      <path d="M14 24l8 8 14-16" fill="none" stroke={O} strokeWidth="4" strokeLinecap="round" />
    </Svg>
  );
}

export function IconStreak(p: P) {
  return (
    <Svg {...p} label={p.label ?? "Streak"}>
      <rect x="8" y="10" width="32" height="30" rx="4" fill="#fff" stroke={O} strokeWidth="3" />
      <path d="M16 8v6M32 8v6" stroke={O} strokeWidth="3" strokeLinecap="round" />
      <path d="M18 26l4 4 8-10" stroke="#2FBF71" strokeWidth="3" strokeLinecap="round" />
    </Svg>
  );
}

export function IconPearl(p: P) {
  return (
    <Svg {...p} label={p.label ?? "Mutiara"}>
      <circle cx="24" cy="26" r="14" fill="url(#pearl)" stroke={O} strokeWidth="3" />
      <defs>
        <radialGradient id="pearl">
          <stop offset="0%" stopColor="#FFF3A0" />
          <stop offset="100%" stopColor="#4DB8FF" />
        </radialGradient>
      </defs>
    </Svg>
  );
}

export function IconMic(p: P) {
  return (
    <Svg {...p} label={p.label ?? "Rekam"}>
      <rect x="18" y="8" width="12" height="22" rx="6" fill="#FF7A59" stroke={O} strokeWidth="3" />
      <path d="M12 22a12 12 0 0 0 24 0M24 34v8" stroke={O} strokeWidth="3" strokeLinecap="round" />
    </Svg>
  );
}

export function IconPlay(p: P) {
  return (
    <Svg {...p} label={p.label ?? "Putar"}>
      <circle cx="24" cy="24" r="18" fill="#8CF07A" stroke={O} strokeWidth="3" />
      <path d="M20 16v16l14-8z" fill={O} />
    </Svg>
  );
}

export function IconBack(p: P) {
  return (
    <Svg {...p} label={p.label ?? "Kembali"}>
      <path d="M28 8L12 24l16 16" fill="none" stroke={O} strokeWidth="4" strokeLinecap="round" />
    </Svg>
  );
}

export function IconEye(p: P) {
  return (
    <Svg {...p} label={p.label ?? "Tampilkan sandi"}>
      <path d="M4 24s8-14 20-14 20 14 20 14-8 14-20 14S4 24 4 24z" fill="#fff" stroke={O} strokeWidth="3" />
      <circle cx="24" cy="24" r="6" fill="#4DB8FF" stroke={O} strokeWidth="2" />
    </Svg>
  );
}

export function IconEyeOff(p: P) {
  return (
    <Svg {...p} label={p.label ?? "Sembunyikan sandi"}>
      <path d="M8 8l32 32M4 24s8-14 20-14c4 0 8 2 11 4" fill="none" stroke={O} strokeWidth="3" />
    </Svg>
  );
}

export function IconMail(p: P) {
  return (
    <Svg {...p} label={p.label ?? "Email"} decorative>
      <rect x="6" y="12" width="36" height="24" rx="4" fill="#EFEBFF" stroke={O} strokeWidth="3" />
      <path d="M6 16l18 12 18-12" fill="none" stroke={O} strokeWidth="3" />
    </Svg>
  );
}

export function IconDelete(p: P) {
  return (
    <Svg {...p} label={p.label ?? "Hapus"}>
      <rect x="14" y="10" width="20" height="28" rx="4" fill="#BFC4D0" stroke={O} strokeWidth="3" />
      <path d="M18 18h12M20 24h8" stroke={O} strokeWidth="3" strokeLinecap="round" />
    </Svg>
  );
}

export function IconStar(p: P) {
  return (
    <Svg {...p} label={p.label ?? "Bintang"} decorative>
      <path d="M24 4l5 11 12 2-9 8 3 12-11-6-11 6 3-12-9-8 12-2z" fill="#FFC933" stroke={O} strokeWidth="2" />
    </Svg>
  );
}

const menuIconMap = {
  tahsin: IconTahsin,
  ziyadah: IconZiyadah,
  murojaah: IconMurojaah,
  ujian: IconUjian,
  ummi: IconUmmi,
  quran: IconUmmi,
  peta: IconPeta,
  lencana: IconLencana,
  laporan: IconLaporan,
  settings: IconSettings,
} as const;

export type MenuIconKey = keyof typeof menuIconMap;

export function MenuIcon({ name, ...p }: P & { name: MenuIconKey }) {
  const C = menuIconMap[name];
  if (!C) return null;
  return <C {...p} />;
}
