import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { GameHeader } from "../components/game/GameHeader";
import { QuranAyahBlock, type QuranAyah } from "../components/QuranAyahBlock";
import { QuranAudioPlayer } from "../components/QuranAudioPlayer";
import { AppPage } from "../components/layout/AppPage";
import { TajweedLegend } from "../components/TajweedLegend";
import { api } from "../lib/api";
import { loadQuranPrefs } from "../lib/quranPrefs";

type SurahMeta = {
  id: number;
  name_ar: string;
  name_id: string;
  ayah_count: number;
  juz_number: number;
};

export function QuranSurahPage() {
  const { surahId: surahIdParam } = useParams();
  const surahId = Number(surahIdParam);
  const prefs = loadQuranPrefs();
  const validId = Number.isFinite(surahId) && surahId >= 1 && surahId <= 114;
  const [activeAyah, setActiveAyah] = useState(1);

  const meta = useQuery({
    queryKey: ["quran", "surahs", "all"],
    queryFn: () => api<SurahMeta[]>("/quran/surahs"),
    enabled: validId,
  });
  const surah = meta.data?.find((s) => s.id === surahId);
  const prevMeta = meta.data?.find((s) => s.id === surahId - 1);
  const nextMeta = meta.data?.find((s) => s.id === surahId + 1);

  const ayahs = useQuery({
    queryKey: ["quran", "ayahs", surahId, prefs.reciterId],
    queryFn: () => api<QuranAyah[]>(`/quran/surahs/${surahId}/ayahs?reciter_id=${encodeURIComponent(prefs.reciterId)}`),
    enabled: validId,
  });

  const audioSources = useMemo(
    () => ayahs.data?.map((a) => a.audio_url) ?? [],
    [ayahs.data],
  );

  const scrollToAyah = useCallback(
    (trackIndex: number) => {
      const ayah = ayahs.data?.[trackIndex];
      if (!ayah) return;
      setActiveAyah(ayah.ayah_number);
      document.getElementById(`ayah-${surahId}-${ayah.ayah_number}`)?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    },
    [ayahs.data, surahId],
  );

  useEffect(() => {
    setActiveAyah(1);
  }, [surahId]);

  if (!validId) {
    return (
      <AppPage>
        <GameHeader title="Al-Quran" to="/quran" />
        <p className="text-center text-outline">Nomor surat tidak valid.</p>
      </AppPage>
    );
  }

  const prev = surahId > 1 ? surahId - 1 : null;
  const next = surahId < 114 ? surahId + 1 : null;
  return (
    <AppPage className="pb-10">
      <GameHeader title={surah?.name_id ?? "Memuat…"} to="/quran" />

      <header className="card-surface p-4 text-center">
        <p className="font-serif text-3xl text-gray-900" dir="rtl" lang="ar">
          {surah?.name_ar ?? "…"}
        </p>
        {surah && (
          <p className="text-sm text-gray-600">
            Surat ke-{surah.id} · {surah.ayah_count} ayat · Juz {surah.juz_number}
          </p>
        )}
      </header>

      <TajweedLegend tone="dark" />

      {ayahs.data && audioSources.some(Boolean) && (
        <div className="sticky top-0 z-10 -mx-4 px-4 py-2">
          <div className="card-surface p-3 shadow-lg">
            <QuranAudioPlayer
              sources={audioSources}
              label="Putar bacaan qori"
              tone="light"
              onTrackIndexChange={scrollToAyah}
            />
          </div>
        </div>
      )}

      {ayahs.isLoading && (
        <p className="text-center text-sm text-muted">
          Memuat ayat… (pertama kali mungkin beberapa detik, data diambil dari Quran.com)
        </p>
      )}
      {ayahs.isError && (
        <p className="rounded-2xl bg-coral/15 p-4 text-sm text-outline">
          {ayahs.error instanceof Error ? ayahs.error.message : "Gagal memuat ayat"}
        </p>
      )}

      <div className="space-y-3">
        {ayahs.data?.map((a) => (
          <QuranAyahBlock
            key={a.ayah_number}
            ayah={a}
            showAudio={false}
            active={a.ayah_number === activeAyah}
            blockId={`ayah-${surahId}-${a.ayah_number}`}
          />
        ))}
      </div>

      <nav className="flex gap-2 pt-2">
        {prev ? (
          <Link to={`/quran/${prev}`} className="flex-1 rounded-2xl bg-white/20 px-2 py-3 text-center text-sm font-bold">
            ← {prevMeta?.name_id ?? `Surat ${prev}`}
          </Link>
        ) : (
          <span className="flex-1" />
        )}
        {next ? (
          <Link to={`/quran/${next}`} className="flex-1 rounded-2xl bg-white/20 px-2 py-3 text-center text-sm font-bold">
            {nextMeta?.name_id ?? `Surat ${next}`} →
          </Link>
        ) : (
          <span className="flex-1" />
        )}
      </nav>
    </AppPage>
  );
}
