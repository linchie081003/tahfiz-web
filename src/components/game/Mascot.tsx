import { useId } from "react";

export type MascotMood = "default" | "happy" | "excited" | "sad";

const O = "#2B1B5E";

/** Maskot bulan sabit (sesuai desain: bulan sabit emas, pipi merah muda, bintang kecil). */
export function Mascot({ mood = "default", size = 120, className = "" }: { mood?: MascotMood; size?: number; className?: string }) {
  const gid = useId().replace(/:/g, "");
  const mouth =
    mood === "sad" ? "M32 74q9-10 20 0" : mood === "excited" || mood === "happy" ? "M32 66q9 12 20 0" : "M33 68q8 8 17 0";
  const eye = mood === "sad" ? "M30 38q8 8 17 0" : "M30 34q8-9 17 0";
  const bounce = mood === "excited" ? "game-wiggle" : "";
  const crescent = "M80 12A50 50 0 1 0 108 88A38 38 0 1 1 80 12Z";

  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      className={`${bounce} ${className}`}
      role="img"
      aria-label="Maskot Hafiz bulan sabit"
    >
      <defs>
        <linearGradient id={`mg${gid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFF3A0" />
          <stop offset="1" stopColor="#FFC933" />
        </linearGradient>
      </defs>
      <path d={crescent} fill={O} transform="translate(0 5)" />
      <path d={crescent} fill={`url(#mg${gid})`} stroke={O} strokeWidth="6" strokeLinejoin="round" />
      <path d={eye} fill="none" stroke={O} strokeWidth="5" strokeLinecap="round" />
      <path d={mouth} fill={mood === "sad" ? "none" : O} stroke={O} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      <ellipse cx="25" cy="55" rx="6" ry="4.5" fill="#FF8FA3" />
      <ellipse cx="38" cy="20" rx="9" ry="5" fill="#fff" opacity=".7" transform="rotate(-25 38 20)" />
      <path
        d="M98 22l3.4 7 7.6.9-5.6 5.2 1.5 7.5-6.9-3.8-6.9 3.8 1.5-7.5-5.6-5.2 7.6-.9z"
        fill="#fff"
        stroke={O}
        strokeWidth="3"
        strokeLinejoin="round"
      />
    </svg>
  );
}
