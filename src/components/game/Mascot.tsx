export type MascotMood = "default" | "happy" | "excited" | "sad";

/** Maskot: bulan sabit emas dengan bintang kecil. */
export function Mascot({ mood = "default", size = 120, className = "" }: { mood?: MascotMood; size?: number; className?: string }) {
  const mouth = mood === "sad" ? "M34 76q9-9 19 0" : "M34 68q9 10 19 0";
  const eye = mood === "sad" ? "M30 44q7 7 15 0" : "M30 42q7-9 15 0";
  const crescent = "M80 12A50 50 0 1 0 108 88A38 38 0 1 1 80 12Z";
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} className={className} role="img" aria-label="Maskot Hafiz">
      <path d={crescent} fill="#F2B01E" />
      <path d={eye} fill="none" stroke="#412402" strokeWidth="5" strokeLinecap="round" />
      <path d={mouth} fill="none" stroke="#412402" strokeWidth="5" strokeLinecap="round" />
      <ellipse cx="26" cy="60" rx="6" ry="4.5" fill="#F26B3A" opacity=".45" />
      <path d="M98 22l3.4 7 7.6.9-5.6 5.2 1.5 7.5-6.9-3.8-6.9 3.8 1.5-7.5-5.6-5.2 7.6-.9z" fill="#4F46B5" />
    </svg>
  );
}
