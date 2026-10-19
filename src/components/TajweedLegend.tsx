import { useQuranPrefs } from "../lib/quranPrefs";

const RULES: { className: string; title: string; desc: string }[] = [
  { className: "tjw-ghunnah", title: "Ghunnah", desc: "Dengung 2 harakat (نْ / مْ)." },
  { className: "tjw-idgham", title: "Idgham", desc: "Masukkan huruf ke nun mati/tanwin." },
  { className: "tjw-ikhfa", title: "Ikhfa", desc: "Samar-kan nun mati/tanwin." },
  { className: "tjw-qalqalah", title: "Qalqalah", desc: "Getar huruf qalqalah saat sukun." },
  { className: "tjw-madda_normal", title: "Mad", desc: "Panjangkan mad sesuai aturan." },
  { className: "tjw-laam_shamsiyah", title: "Lam syamsiyah", desc: "Lam ra/ta/dz… dibaca tipis." },
  { className: "tjw-meem_shafawi", title: "Mim syafawi", desc: "Mim bertemu ba dengan ghunnah." },
  { className: "tjw-ham_wasl", title: "Hamzah wasl", desc: "Hamzah wasl (sering tidak dibaca)." },
];

type Props = {
  tone?: "light" | "dark";
  defaultOpen?: boolean;
};

export function TajweedLegend({ tone = "light", defaultOpen = false }: Props) {
  const prefs = useQuranPrefs();

  if (!prefs.showTajweed) return null;

  const titleClass = tone === "light" ? "text-purple-900" : "text-white";
  const textClass = tone === "light" ? "text-gray-700" : "text-white/90";

  return (
    <details className={tone === "light" ? "card-surface p-4" : "rounded-2xl bg-white/10 p-4"} open={defaultOpen}>
      <summary className={`cursor-pointer text-sm font-bold ${titleClass}`}>Keterangan warna tajwid</summary>
      <ul className={`mt-3 space-y-2 text-sm ${textClass}`}>
        {RULES.map((r) => (
          <li key={r.className} className="flex gap-2">
            <span className="quran-ayah--tajweed shrink-0 text-base leading-none" aria-hidden>
              <span className={`tjw ${r.className}`}>●</span>
            </span>
            <span>
              <strong>{r.title}</strong> — {r.desc}
            </span>
          </li>
        ))}
      </ul>
      <p className={`mt-2 text-xs ${tone === "light" ? "text-gray-500" : "text-white/70"}`}>
        Warna mengikuti markup Quran.com. Matikan di Pengaturan jika ingin teks polos.
      </p>
    </details>
  );
}
