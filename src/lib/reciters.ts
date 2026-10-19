export type ReciterOption = {
  id: string;
  label: string;
  gender: string;
  description: string;
  style?: string;
  default_for_age?: boolean;
};

/** Cadangan jika API qori tidak terjangkau */
export const FALLBACK_RECITERS: ReciterOption[] = [
  {
    id: "husary_muallim",
    label: "Mahmud Khalil Al-Husary (Muallim)",
    gender: "male",
    description: "Pelan, per ayat — utama PAUD & SD",
    style: "muallim",
  },
  {
    id: "husary",
    label: "Mahmud Khalil Al-Husary (Murattal)",
    gender: "male",
    description: "Murattal — remaja/dewasa & pilihan kedua anak",
    style: "murattal",
  },
  {
    id: "minshawi",
    label: "Muhammad Siddiq Al-Minshawi (Murattal)",
    gender: "male",
    description: "Murattal jelas — remaja & dewasa",
    style: "murattal",
  },
  { id: "alafasy", label: "Misyari Al-Afasy", gender: "male", description: "Murattal alternatif", style: "murattal" },
];

export function filterRecitersForGender(all: ReciterOption[], gender: "all" | "male" | "female"): ReciterOption[] {
  if (gender === "all") return all;
  const filtered = all.filter((r) => r.gender === gender);
  return filtered.length ? filtered : all;
}
