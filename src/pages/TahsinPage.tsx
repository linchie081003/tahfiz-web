import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ArabicAyahText } from "../components/ArabicAyahText";
import { QuranAudioPlayer } from "../components/QuranAudioPlayer";
import { GameHeader } from "../components/game/GameHeader";
import { AppPage } from "../components/layout/AppPage";
import { TajweedLegend } from "../components/TajweedLegend";
import { StatusCard } from "../components/game/StatusBadge";
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
  if (!data) return <div className="p-4 pr-14">Memuat…</div>;
  const q = new URLSearchParams({
    context: "tahsin",
    text: data.reference_text,
    surah_id: String(data.surah_id),
    ayah_start: "1",
    ayah_end: "2",
  });
  return (
    <AppPage>
      <GameHeader title="Tahsin" to="/" />
      <StatusCard kind="tahsin" code={data.status} hint={data.hint} />
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
    </AppPage>
  );
}
