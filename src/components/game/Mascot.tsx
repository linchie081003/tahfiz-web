export type MascotMood = "default" | "happy" | "excited" | "sad";

const O = "#2B1B5E";

export function Mascot({ mood = "default", size = 120, className = "" }: { mood?: MascotMood; size?: number; className?: string }) {
  const eyeY = mood === "sad" ? 30 : 28;
  const mouth =
    mood === "happy" || mood === "excited"
      ? "M14 34 Q24 42 34 34"
      : mood === "sad"
        ? "M14 38 Q24 32 34 38"
        : "M16 34 Q24 38 32 34";
  const bounce = mood === "excited" ? "game-wiggle" : "";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      className={`${bounce} ${className}`}
      role="img"
      aria-label="Maskot Hafiz bulan sabit"
    >
      <defs>
        <linearGradient id="mascotGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFF3A0" />
          <stop offset="100%" stopColor="#FFC933" />
        </linearGradient>
      </defs>
      <path
        d="M38 24a18 18 0 1 1-36 0 18 18 0 0 1 36 0Z"
        fill="url(#mascotGrad)"
        stroke={O}
        strokeWidth="3"
      />
      <path d="M8 24a16 16 0 0 0 32 0" fill="#FFF3A0" stroke={O} strokeWidth="3" />
      <path d="M18 8l2 6 6-2-2 6 6 2-6 2 2 6-6-2-2 6-2-6-6 2 2-6-6-2 6-2z" fill="#fff" stroke={O} strokeWidth="1.5" />
      <path d={`M16 ${eyeY} Q20 ${eyeY + 4} 24 ${eyeY} Q28 ${eyeY + 4} 32 ${eyeY}`} fill="none" stroke={O} strokeWidth="2.5" strokeLinecap="round" />
      <path d={mouth} fill="none" stroke={O} strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="14" cy="32" r="3" fill="#FF8FA3" opacity="0.9" />
      <circle cx="34" cy="32" r="3" fill="#FF8FA3" opacity="0.9" />
    </svg>
  );
}
