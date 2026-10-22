export type MascotMood = "default" | "happy" | "excited" | "sad";

/** Maskot: bintang emas tersenyum dengan bulan sabit kecil (sesuai design). */
export function Mascot({ mood = "default", size = 120, className = "" }: { mood?: MascotMood; size?: number; className?: string }) {
  const mouth = mood === "sad" ? "M16.5 31.4 Q20 28 23.5 31.4" : "M16.5 29.2 Q20 32.6 23.5 29.2";
  return (
    <svg viewBox="0 0 44 44" width={size} height={size} className={className} role="img" aria-label="Maskot Hafiz">
      <polygon points="20.0,8.0 25.8,17.1 36.2,19.7 29.3,28.0 30.0,38.8 20.0,34.8 10.0,38.8 10.7,28.0 3.8,19.7 14.2,17.1" fill="#F2B01E" stroke="#F2B01E" strokeWidth="3.5" strokeLinejoin="round" />
      <circle cx="15.5" cy="25" r="2.2" fill="#412402" />
      <circle cx="24.5" cy="25" r="2.2" fill="#412402" />
      <circle cx="12.6" cy="29" r="1.8" fill="#F26B3A" opacity=".55" />
      <circle cx="27.4" cy="29" r="1.8" fill="#F26B3A" opacity=".55" />
      <path d={mouth} stroke="#412402" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M37 3 A7.2 7.2 0 1 0 37 17.4 A5.6 5.6 0 0 1 37 3Z" fill="#4F46B5" />
    </svg>
  );
}
