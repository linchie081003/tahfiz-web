/** Ikon vektor putih untuk tombol menu bulat (sesuai desain). */
import type { ReactNode } from "react";

export type GlyphKey = "tahsin" | "ziyadah" | "murojaah" | "ujian" | "peta" | "lencana" | "quran" | "laporan" | "settings";

function G({ children, size = 34 }: { children: ReactNode; size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="#fff"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function MenuGlyph({ name, size }: { name: GlyphKey; size?: number }) {
  switch (name) {
    case "tahsin":
      return (
        <G size={size}>
          <rect x="9" y="3" width="6" height="11" rx="3" fill="#fff" />
          <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
        </G>
      );
    case "ziyadah":
      return (
        <G size={size}>
          <path d="M12 6c-2-1.6-5-2-8-1.6v13c3-.4 6 0 8 1.6 2-1.6 5-2 8-1.6v-13c-3-.4-6 0-8 1.6zM12 6v13" />
        </G>
      );
    case "murojaah":
      return (
        <G size={size}>
          <path d="M4 11V9a3 3 0 0 1 3-3h11M15 3l3 3-3 3M20 13v2a3 3 0 0 1-3 3H6M9 21l-3-3 3-3" />
        </G>
      );
    case "ujian":
      return (
        <G size={size}>
          <rect x="5" y="11" width="14" height="10" rx="3" fill="#fff" />
          <path d="M8 11V8a4 4 0 0 1 8 0v3" />
        </G>
      );
    case "peta":
      return (
        <G size={size}>
          <path d="M6 21V4M6 5h11l-2.5 3.5L17 12H6" fill="#fff" />
        </G>
      );
    case "lencana":
      return (
        <G size={size}>
          <path d="M7 4h10v5a5 5 0 0 1-10 0zM7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3M12 14v4M8 21h8M10 18h4" />
        </G>
      );
    case "quran":
      return (
        <G size={size}>
          <path d="M6 3h11a2 2 0 0 1 2 2v15H8a2 2 0 0 1-2-2z" />
          <path d="M6 18a2 2 0 0 1 2-2h11" />
          <path d="M13.6 7.4a3 3 0 1 0 1.9 4.4 2.4 2.4 0 1 1-1.9-4.4z" fill="#fff" />
        </G>
      );
    case "laporan":
      return (
        <G size={size}>
          <path d="M6 20V11M12 20V5M18 20v-6" strokeWidth="3.2" />
        </G>
      );
    case "settings":
      return (
        <G size={size}>
          <path d="M4 7h9M17 7h3M4 17h3M11 17h9" />
          <circle cx="15" cy="7" r="2.2" fill="#fff" />
          <circle cx="9" cy="17" r="2.2" fill="#fff" />
        </G>
      );
  }
}
