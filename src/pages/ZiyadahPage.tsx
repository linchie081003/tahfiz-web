import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { QuranAyahBlock } from "../components/QuranAyahBlock";
import { GameHeader } from "../components/game/GameHeader";
import { AppPage } from "../components/layout/AppPage";
import { TajweedLegend } from "../components/TajweedLegend";
import { api } from "../lib/api";
import { loadQuranPrefs } from "../lib/quranPrefs";

type Ayah = {
  ayah_number: number;
  text_uthmani: string;
  text_tajweed?: string | null;
  audio_url: string | null;
};

export function ZiyadahPage() {
  const prefs = loadQuranPrefs();
  const peta = useQuery({ queryKey: ["peta"], queryFn: () => api<{ active_surah_id: number | null }>("/peta/juz/30") });
  const surahId = peta.data?.active_surah_id ?? 114;
  const ayahs = useQuery({
    queryKey: ["ayahs", surahId, prefs.reciterId],
    queryFn: () => api<Ayah[]>(`/quran/surahs/${surahId}/ayahs?reciter_id=${prefs.reciterId}`),
    enabled: Boolean(surahId),
  });
  const first = ayahs.data?.[0];
  const q = new URLSearchParams({
    context: "ziyadah",
    text: first?.text_uthmani ?? "",
    surah_id: String(surahId),
    ayah_start: String(first?.ayah_number ?? 1),
    ayah_end: String(first?.ayah_number ?? 1),
  });
  return (
    <AppPage>
      <GameHeader title="Hafalan baru" to="/" />
      <TajweedLegend tone="dark" />
      {first && (
        <>
          <QuranAyahBlock ayah={first} />
          <Link to={`/setor?${q}`} className="btn-cta block text-center">
            Rekam setoran ayat
          </Link>
        </>
      )}
    </AppPage>
  );
}
