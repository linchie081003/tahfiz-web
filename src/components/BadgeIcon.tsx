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
