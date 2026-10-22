import type { CSSProperties } from "react";

const isMark = (c: string) => /\p{M}/u.test(c);

/** Tulisan Arab sederhana; huruf atau tanda yang menjadi poin penilaian diberi warna. */
export function FocusArabic({ text, focus, color = "#FFD34D", className = "", style }: { text: string; focus?: string; color?: string; className?: string; style?: CSSProperties }) {
  const set = new Set([...(focus ?? "")]);
  // Kelompokkan huruf dasar dengan tanda baris (harakat) yang mengikutinya.
  const groups: string[] = [];
  for (const ch of [...text]) {
    if (isMark(ch) && groups.length) groups[groups.length - 1] += ch;
    else groups.push(ch);
  }
  return (
    <span dir="rtl" lang="ar" className={`font-arab ${className}`} style={style}>
      {groups.map((g, i) => {
        const [base, ...marks] = [...g];
        const hitBase = set.has(base);
        if (hitBase) return <span key={i} style={{ color }} data-focus="1">{g}</span>;
        if (marks.some((m) => set.has(m))) {
          return <span key={i}>{base}{marks.map((m, j) => (set.has(m) ? <span key={j} style={{ color }} data-focus="1">{m}</span> : m))}</span>;
        }
        return <span key={i}>{g}</span>;
      })}
    </span>
  );
}
