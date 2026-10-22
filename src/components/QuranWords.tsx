import { useMemo } from "react";
import { useQuranPrefs } from "../lib/quranPrefs";
import { looksLikeTajweedMarkup, tajweedWords } from "../lib/tajweedHtml";

type Props = {
  textUthmani: string;
  textTajweed?: string | null;
  /** indeks kata yang disembunyikan (mode hafalan) */
  hidden?: Set<number>;
  peek?: boolean;
  className?: string;
  hiddenClassName?: string;
};

/** Teks Arab per kata, berwarna tajwid bila tersedia dan diaktifkan di Pengaturan. */
export function QuranWords({ textUthmani, textTajweed, hidden, peek, className = "", hiddenClassName = "" }: Props) {
  const prefs = useQuranPrefs();
  const useTajweed = prefs.showTajweed && !!textTajweed && looksLikeTajweedMarkup(textTajweed);
  const words = useMemo(() => (useTajweed ? tajweedWords(textTajweed!) : textUthmani.split(/\s+/).filter(Boolean)), [useTajweed, textTajweed, textUthmani]);
  return (
    <span dir="rtl" lang="ar" className={`quran-ayah ${useTajweed ? "quran-ayah--tajweed" : ""} ${className}`}>
      {words.map((w, i) =>
        hidden?.has(i) && !peek ? (
          <span key={i} aria-hidden="true" className={`mx-1.5 inline-block h-[56px] w-[88px] rounded-2xl border-2 border-dashed border-brand/60 bg-lav align-middle ${hiddenClassName}`} />
        ) : (
          <span key={i} className="mx-1.5 inline-block" dangerouslySetInnerHTML={{ __html: w }} />
        ),
      )}
    </span>
  );
}
