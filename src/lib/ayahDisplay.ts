export type AyahLine = {
  ayah_number: number;
  text_uthmani: string;
  text_tajweed?: string | null;
};

export function mergeAyahRange(ayahs: AyahLine[], start: number, end: number) {
  const sel = ayahs.filter((a) => a.ayah_number >= start && a.ayah_number <= end).sort((a, b) => a.ayah_number - b.ayah_number);
  if (!sel.length) return { textUthmani: "", textTajweed: null as string | null };
  const textUthmani = sel.map((a) => a.text_uthmani).join(" ");
  const textTajweed = sel.some((a) => a.text_tajweed) ? sel.map((a) => a.text_tajweed ?? a.text_uthmani).join(" ") : null;
  return { textUthmani, textTajweed };
}
