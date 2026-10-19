import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ArabicAyahText } from "../components/ArabicAyahText";
import { QuranAudioPlayer } from "../components/QuranAudioPlayer";
import { TajweedLegend } from "../components/TajweedLegend";
import { api } from "../lib/api";
import { loadQuranPrefs } from "../lib/quranPrefs";

type TahsinReference = {
  reference_text: string;
  text_tajweed?: string | null;
  audio_urls: string[];
  status: string;
  hint: string;
  surah_id: number;
};

export function TahsinPage() {
  const prefs = loadQuranPrefs();
  const { data } = useQuery({
    queryKey: ["tahsin", prefs.reciterId],
    queryFn: () =>
      api<TahsinReference>(`/tahsin/reference?reciter_id=${encodeURIComponent(prefs.reciterId)}`),
  });
  if (!data) return <div className="p-4">Memuat…</div>;
  const q = new URLSearchParams({
    context: "tahsin",
    text: data.reference_text,
    surah_id: String(data.surah_id),
    ayah_start: "1",
    ayah_end: "2",
  });
  return (
    <div className="space-y-4 p-4">
      <Link to="/" className="text-white underline">
        ← Home
      </Link>
      <h1 className="text-2xl font-extrabold">Tahsin</h1>
      <p className="text-sm opacity-90">Status: {data.status}</p>
      <p className="text-sm">{data.hint}</p>
      <TajweedLegend tone="dark" />
      <div className="card-surface p-4">
        <ArabicAyahText textUthmani={data.reference_text} textTajweed={data.text_tajweed} />
      </div>
      <div className="card-surface p-4 space-y-2">
        <QuranAudioPlayer sources={data.audio_urls} label="Dengarkan qori dulu" />
      </div>
      <Link to={`/setor?${q}`} className="btn-cta block text-center">
        Rekam & setor tahsin
      </Link>
    </div>
  );
}
