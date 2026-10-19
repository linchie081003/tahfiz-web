export type ReciterOption = {
  id: string;
  label: string;
  gender: string;
  description: string;
};

/** Cadangan jika API qori tidak terjangkau */
export const FALLBACK_RECITERS: ReciterOption[] = [
  { id: "alafasy", label: "Misyari Al-Afasy", gender: "male", description: "Jelas, cocok anak & pemula" },
  { id: "saad", label: "Saad Al-Ghamdi", gender: "male", description: "Tenang, tempo sedang" },
  { id: "sudais", label: "Abdurrahman As-Sudais", gender: "male", description: "Imam Masjidil Haram" },
  { id: "yasser", label: "Yasser Al-Dosari", gender: "male", description: "Murattal jelas" },
  { id: "salah_budair", label: "Salah Al-Budair", gender: "male", description: "Murattal jelas" },
  { id: "ayyoub", label: "Muhammad Ayyoub", gender: "male", description: "Pelafalan tajwid rapi" },
];

export function filterRecitersForGender(all: ReciterOption[], gender: "all" | "male" | "female"): ReciterOption[] {
  if (gender === "all") return all;
  const filtered = all.filter((r) => r.gender === gender);
  return filtered.length ? filtered : all;
}
