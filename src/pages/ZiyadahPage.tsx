import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ListenCard } from "../components/game/ListenCard";
import { Btn, Card, Chip, Page, ScreenHead } from "../components/ui/ui";
import { StateScreen } from "../components/ui/StateScreen";
import { api, type HomeData } from "../lib/api";
import { loadQuranPrefs } from "../lib/quranPrefs";

type Ayah = { ayah_number: number; text_uthmani: string; text_tajweed?: string | null; audio_url: string | null };
const GOAL = 10;

/** Hafalan baru: dengar, ulang, samarkan kata, baca tanpa melihat. Keputusan lanjut ada pada guru atau orang tua. */
export function ZiyadahPage() {
  const nav = useNavigate();
  const prefs = loadQuranPrefs();
  const home = useQuery({ queryKey: ["home"], queryFn: () => api<HomeData>("/home") });
  const peta = useQuery({ queryKey: ["peta"], queryFn: () => api<{ active_surah_id: number | null; active_surah_name?: string }>("/peta/juz/30") });
  const surahId = peta.data?.active_surah_id ?? 114;
  const ayahs = useQuery({ queryKey: ["ayahs", surahId, prefs.reciterId], queryFn: () => api<Ayah[]>(`/quran/surahs/${surahId}/ayahs?reciter_id=${prefs.reciterId}`), enabled: Boolean(surahId) });
  const first = ayahs.data?.[0];
  const key = `hafiz_ulang_${surahId}_${first?.ayah_number ?? 1}`;
  const [count, setCount] = useState(() => { try { return Number(localStorage.getItem(key) ?? 0); } catch { return 0; } });
  const [hidden, setHidden] = useState(0);
  const [peek, setPeek] = useState(false);
  const words = useMemo(() => (first?.text_uthmani ?? "").split(/\s+/).filter(Boolean), [first]);
  const hideIdx = useMemo(() => new Set(words.map((_, i) => i).filter((i) => i % 2 === 1).slice(0, hidden)), [words, hidden]);

  if (home.data?.menu_locks.ziyadah) {
    const waiting = home.data.tahsin_status === "pending_eval";
    return (
      <StateScreen mood={waiting ? "happy" : "default"} title={waiting ? `Hebat, ${home.data.greeting_name}!` : "Hafalan baru belum terbuka"}
        lead={waiting ? "Pulau 1, 2, dan 3 sudah kamu kerjakan." : home.data.menu_locks.ziyadah}
        actions={[{ label: "Lanjut latihan tahsin", onClick: () => nav("/tahsin") }]}>
        {waiting && <Card tone="lav"><p className="font-extrabold">Gerbang hafalan menunggu</p><p className="text-sm font-semibold text-muted">Minta Ayah atau Ibu mendengarkan bacaanmu, lalu membuka gerbangnya.</p></Card>}
      </StateScreen>
    );
  }
  const q = new URLSearchParams({ context: "ziyadah", text: first?.text_uthmani ?? "", surah_id: String(surahId), ayah_start: String(first?.ayah_number ?? 1), ayah_end: String(first?.ayah_number ?? 1) });
  const bump = () => { const n = Math.min(GOAL, count + 1); setCount(n); try { localStorage.setItem(key, String(n)); } catch { /* abaikan */ } };
  return (
    <Page>
      <ScreenHead to="/" eyebrow="Hafalan baru" title={peta.data?.active_surah_name ?? `Surat ${surahId}`} sub={first ? `Ayat ${first.ayah_number} dari ${ayahs.data?.length}` : undefined} right={<Chip tone="gold">Ulangan {count} dari {GOAL}</Chip>} />
      {first && (
        <>
          <Card tone="plain" className="min-h-[170px] text-center">
            <p dir="rtl" lang="ar" className="font-quran text-[2.4rem] leading-[2.3]">
              {words.map((w, i) => <span key={i} className={hideIdx.has(i) && !peek ? "mx-1 inline-block rounded-xl bg-lav px-4 text-transparent" : "mx-1"}>{w}</span>)}
            </p>
            {hidden > 0 && <p className="text-sm font-bold text-muted">{hideIdx.size} dari {words.length} kata disembunyikan. Coba sebut semuanya!</p>}
          </Card>
          <ListenCard urls={first.audio_url ? [first.audio_url] : []} caption={`Contoh bacaan ayat ${first.ayah_number}`} />
          <div className="grid grid-cols-3 gap-2">
            <Btn variant="soft" className="!text-base" onClick={bump}>Ulang</Btn>
            <Btn variant="soft" className="!text-base" onClick={() => setHidden((h) => Math.min(Math.floor(words.length / 2), h + 1))}>Samarkan</Btn>
            <Btn variant="soft" className="!text-base" onMouseDown={() => setPeek(true)} onMouseUp={() => setPeek(false)} onTouchStart={() => setPeek(true)} onTouchEnd={() => setPeek(false)}>Intip</Btn>
          </div>
          <Link to={`/setor?${q}`} className="flex min-h-[56px] items-center justify-center rounded-pill bg-brand text-lg font-extrabold text-white">Baca tanpa melihat</Link>
          <p className="text-center text-sm font-bold text-muted">Guru atau orang tua yang memutuskan lanjut ke ayat berikutnya.</p>
        </>
      )}
    </Page>
  );
}
