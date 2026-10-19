import { useQuranPrefs } from "../lib/quranPrefs";
import { looksLikeTajweedMarkup, prepareTajweedHtml } from "../lib/tajweedHtml";

type Props = {
  textUthmani: string;
  textTajweed?: string | null;
  className?: string;
};

const sizeClass = {
  medium: "text-2xl leading-[2.4]",
  large: "text-3xl leading-[2.6]",
  xlarge: "text-4xl leading-[2.8]",
};

export function ArabicAyahText({ textUthmani, textTajweed, className = "" }: Props) {
  const prefs = useQuranPrefs();
  const size = sizeClass[prefs.arabicFontSize] ?? sizeClass.large;
  const baseClass = `quran-ayah ${size} ${className}`;

  const useTajweed =
    prefs.showTajweed && textTajweed && looksLikeTajweedMarkup(textTajweed);

  if (useTajweed) {
    const html = prepareTajweedHtml(textTajweed);
    return (
      <div
        className={`${baseClass} quran-ayah--tajweed`}
        dir="rtl"
        lang="ar"
        aria-label="Teks ayat Al-Qur'an dengan tajwid"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  return (
    <div className={baseClass} dir="rtl" lang="ar" aria-label="Teks ayat Al-Qur'an">
      {textUthmani}
    </div>
  );
}
