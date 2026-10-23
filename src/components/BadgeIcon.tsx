/** Ikon lencana orisinal: medali dengan simbol sesuai jenis syarat. Terkunci tampil abu-abu. */
const GLYPH: Record<string, (c: string) => JSX.Element> = {
  tahsin: (c) => (
    <g fill="none" stroke={c} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="21" y="14" width="10" height="16" rx="5" />
      <path d="M16 26a10 10 0 0 0 20 0M26 36v5M20 41h12" />
    </g>
  ),
  juz30: (c) => (
    <g fill="none" stroke={c} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 16c5-2 9-1 12 2 3-3 7-4 12-2v22c-5-2-9-1-12 2-3-3-7-4-12-2z" />
      <path d="M26 18v22" />
    </g>
  ),
  hafalan: (c) => (
    <g fill="none" stroke={c} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M26 38V22M26 22c-1-6-6-8-10-8 0 5 3 9 10 8zM26 26c1-6 6-8 10-8 0 5-3 9-10 8z" />
      <path d="M19 40h14" />
    </g>
  ),
  murojaah: (c) => (
    <g fill="none" stroke={c} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M36 24a10 10 0 1 1-3-7M36 12v7h-7" />
    </g>
  ),
  sambung: (c) => (
    <g fill="none" stroke={c} strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 30l-3 3a5 5 0 0 1-7-7l5-5a5 5 0 0 1 7 0M30 22l3-3a5 5 0 0 1 7 7l-5 5a5 5 0 0 1-7 0M22 30l8-8" />
    </g>
  ),
  tanda: (c) => (
    <g fill="none" stroke={c} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 14v28M18 16h18l-4 7 4 7H18" />
    </g>
  ),
  level: (c) => (
    <g fill="none" stroke={c} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M26 40V16M16 26l10-10 10 10M17 41h18" />
    </g>
  ),
  streak: (c) => (
    <path d="M27 12c1 6 8 9 8 18a9 9 0 0 1-18 0c0-4 2-6 4-8 0 3 2 4 3 4-2-6 0-10 3-14z" fill={c} stroke={c} strokeWidth="2" strokeLinejoin="round" />
  ),
};

export function BadgeIcon({ kind, earned, size = 72 }: { kind?: string | null; earned: boolean; size?: number }) {
  const ring = earned ? "#F2B01E" : "#CFCBEF";
  const face = earned ? "#FFF3B8" : "#ECEAF8";
  const ink = earned ? "#0F766E" : "#9A97B8";
  const glyph = (kind && GLYPH[kind]) || ((c: string) => <path d="M26 12l4.2 8.6 9.5 1.4-6.9 6.7 1.6 9.5L26 33.7l-8.5 4.5 1.6-9.5-6.9-6.7 9.5-1.4z" fill={c} stroke={c} strokeWidth="2" strokeLinejoin="round" />);
  return (
    <svg width={size} height={size} viewBox="0 0 52 52" aria-hidden="true" className={earned ? "drop-shadow-[0_3px_0_rgba(201,138,0,0.35)]" : ""}>
      <path d="M17 2h8l4 14h-8zM35 2h-8l-4 14h8z" fill={earned ? "#6C63C9" : "#D9D6F0"} />
      <circle cx="26" cy="29" r="21" fill={ring} />
      <circle cx="26" cy="29" r="17" fill={face} />
      <g transform="translate(0 3)">{glyph(ink)}</g>
    </svg>
  );
}
