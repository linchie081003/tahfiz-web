import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, Page } from "../components/ui/ui";
import { QuranWords } from "../components/QuranWords";
import { TajweedLegend } from "../components/TajweedLegend";
import { NavMic, NavPlay } from "../components/icons/NavIcons";
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
  useEffect(() => { try { setCount(Number(localStorage.getItem(key) ?? 0)); } catch { setCount(0); } }, [key]);
  const [hidden, setHidden] = useState(0);
  const [peek, setPeek] = useState(false);
  const [listened, setListened] = useState(false);
  const [playing, setPlaying] = useState(false);
  const audio = useRef<HTMLAudioElement | null>(null);
  useEffect(() => () => audio.current?.pause(), []);
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
  const listen = () => {
    if (!first?.audio_url) return;
    const el = audio.current ?? (audio.current = new Audio());
    if (playing) { el.pause(); setPlaying(false); return; }
    el.src = first.audio_url;
    el.onended = () => setPlaying(false);
    el.onerror = () => setPlaying(false);
    setListened(true);
    void el.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  };
  const step = !listened ? 0 : count === 0 ? 1 : hidden === 0 ? 2 : 3;
  const STEPS = ["Dengar", "Ulang", "Samarkan", "Baca"];
  const ACTIONS = [listen, bump, () => setHidden((h) => Math.min(Math.floor(words.length / 2), h + 1)), () => nav(`/setor?${q}`)];
  const total = ayahs.data?.length ?? 0;
  const next = (first?.ayah_number ?? 1) + 1;
  return (
    <div className="app-page flex min-h-dvh flex-col gap-4 px-4 pb-28 pt-3">
      <header className="flex items-center gap-2">
        <button type="button" aria-label="Kembali" onClick={() => nav("/")} className="-ml-2 flex h-11 w-11 items-center justify-center text-brand">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg>
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="text-[26px] font-extrabold leading-tight text-outline">Hafalan baru</h1>
          <p className="text-sm font-semibold text-muted">{peta.data?.active_surah_name ?? `Surat ${surahId}`}{first ? `, ayat ${first.ayah_number} dari ${total}` : ""}</p>
        </div>
      </header>

      <ol className="flex gap-2" aria-label="Langkah hafalan">
        {STEPS.map((t, i) => (
          <li key={t} className="flex-1" aria-current={i === step ? "step" : undefined}>
            <button type="button" onClick={ACTIONS[i]} className={`flex min-h-[44px] w-full items-center justify-center gap-1 rounded-pill px-2 text-[15px] font-extrabold ${i === step ? "bg-brand text-white" : i < step ? "bg-lav text-brand-dark" : "bg-[#E4E4EE] text-muted"}`}>
              {i < step && <span aria-hidden="true">✓</span>}{t}
            </button>
          </li>
        ))}
      </ol>

      {first && (
        <>
          <Card tone="lav" className="min-h-[200px] text-center">
            <p className="block"><QuranWords textUthmani={first.text_uthmani} textTajweed={first.text_tajweed} hidden={hideIdx} peek={peek} className="text-[2.9rem] leading-[2.5]" /></p>
            {hidden > 0 && <p className="mt-2 text-[15px] font-semibold text-muted">{hideIdx.size} dari {words.length} kata disembunyikan. Coba sebut semuanya!</p>}
          </Card>

          <TajweedLegend tone="dark" />

          <div className="text-center">
            <div className="flex justify-center gap-2" role="img" aria-label={`Ulangan ${count} dari ${GOAL}`}>
              {Array.from({ length: GOAL }, (_, i) => <span key={i} className={`h-3.5 w-3.5 rounded-full ${i < count ? "bg-brand" : "bg-lav"}`} />)}
            </div>
            <p className="mt-2 text-sm font-extrabold text-muted">Ulangan {count} dari {GOAL}</p>
          </div>

          <div className="mt-2 flex items-start justify-around">
            <div className="flex w-20 flex-col items-center gap-1.5">
              <button type="button" aria-label="Intip" onMouseDown={() => setPeek(true)} onMouseUp={() => setPeek(false)} onMouseLeave={() => setPeek(false)} onTouchStart={() => setPeek(true)} onTouchEnd={() => setPeek(false)}
                className="mt-4 flex h-[72px] w-[72px] items-center justify-center rounded-full bg-cream text-gold-ink">
                <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 5C6.5 5 2.7 9.2 1.5 12c1.2 2.8 5 7 10.500 7s9.300-4.200 10.500-7C21.300 9.200 17.500 5 12 5zm0 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm0-2.300a1.700 1.700 0 1 0 0-3.400 1.700 1.700 0 0 0 0 3.400z" /></svg>
              </button>
              <span className="text-sm font-extrabold text-gold-ink">Intip</span>
            </div>

            <div className="flex flex-col items-center gap-2">
              <Link to={`/setor?${q}`} aria-label="Baca tanpa melihat" className="flex h-[140px] w-[140px] items-center justify-center rounded-full bg-brand text-white ring-[10px] ring-lav"><NavMic size={60} /></Link>
              <span className="font-extrabold text-brand-dark">Baca tanpa melihat</span>
            </div>

            <div className="flex w-20 flex-col items-center gap-1.5">
              <button type="button" aria-label={playing ? "Jeda" : "Dengar"} onClick={listen} disabled={!first.audio_url}
                className="mt-4 flex h-[72px] w-[72px] items-center justify-center rounded-full bg-lav text-brand disabled:opacity-50"><NavPlay size={30} /></button>
              <span className="text-sm font-extrabold text-brand-dark">Dengar</span>
            </div>
          </div>

          <p className="mt-auto flex items-center gap-3 rounded-[24px] bg-lav px-4 py-3.5 font-extrabold text-brand-dark">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="3" /><path d="M8 11V8a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" /></svg>
            Guru atau orang tua yang memutuskan lanjut ke ayat {next}
          </p>
        </>
      )}
    </div>
  );
}
