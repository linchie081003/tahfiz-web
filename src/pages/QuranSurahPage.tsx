import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api, type HomeData } from "../lib/api";
import { loadQuranPrefs } from "../lib/quranPrefs";
import { NavPlay, NavStar } from "../components/icons/NavIcons";
import { Toggle } from "../components/ui/ui";

type SurahMeta = { id: number; name_ar: string; name_id: string; ayah_count: number; juz_number: number };
type Ayah = { ayah_number: number; text_uthmani: string; text_tajweed?: string | null; audio_url: string | null };
export const LAST_SURAH_KEY = "hafiz_last_surah";
const RATES = [1, 0.75, 1.25];
const QARI: Record<string, string> = { husary_muallim: "Al-Husary, Mu'allim", husary: "Al-Husary, murattal", minshawi: "Al-Minshawi, murattal", minshawi_mujawwad: "Al-Minshawi, mujawwad" };
const arabicDigits = (n: number) => String(n).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[Number(d)]);

/** Tilawah: baca surat dengan bacaan qori; ayat ikut tersorot, tanpa penilaian. */
export function QuranSurahPage() {
  const { surahId: p } = useParams();
  const nav = useNavigate();
  const surahId = Number(p);
  const valid = Number.isFinite(surahId) && surahId >= 1 && surahId <= 114;
  const prefs = loadQuranPrefs();
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [follow, setFollow] = useState(true);
  const [rateI, setRateI] = useState(0);
  const audio = useRef<HTMLAudioElement | null>(null);

  const home = useQuery({ queryKey: ["home"], queryFn: () => api<HomeData>("/home") });
  const meta = useQuery({ queryKey: ["quran", "surahs", "all"], queryFn: () => api<SurahMeta[]>("/quran/surahs"), enabled: valid });
  const ayahs = useQuery({ queryKey: ["quran", "ayahs", surahId, prefs.reciterId], queryFn: () => api<Ayah[]>(`/quran/surahs/${surahId}/ayahs?reciter_id=${encodeURIComponent(prefs.reciterId)}`), enabled: valid });
  const surah = meta.data?.find((s) => s.id === surahId);
  const list = ayahs.data ?? [];

  useEffect(() => { if (valid) try { localStorage.setItem(LAST_SURAH_KEY, String(surahId)); } catch { /* abaikan */ } }, [surahId, valid]);
  useEffect(() => { setIdx(0); setPlaying(false); audio.current?.pause(); }, [surahId]);
  useEffect(() => () => audio.current?.pause(), []);
  useEffect(() => { if (follow) document.getElementById(`ay-${idx}`)?.scrollIntoView({ behavior: "smooth", block: "center" }); }, [idx, follow]);

  const play = (i: number) => {
    const a = list[i]?.audio_url;
    if (!a) { setPlaying(false); return; }
    const el = audio.current ?? (audio.current = new Audio());
    el.src = a;
    el.playbackRate = RATES[rateI];
    el.onended = () => { if (i + 1 < list.length) { setIdx(i + 1); play(i + 1); } else setPlaying(false); };
    el.onerror = () => setPlaying(false);
    setIdx(i);
    void el.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  };
  const toggle = () => { if (playing) { audio.current?.pause(); setPlaying(false); } else play(idx); };
  const cycleRate = () => { const n = (rateI + 1) % RATES.length; setRateI(n); if (audio.current) audio.current.playbackRate = RATES[n]; };

  if (!valid) return <p className="p-8 text-center font-extrabold">Nomor surat tidak valid.</p>;
  const pct = Math.min(100, Math.max(0, (home.data?.level_progress ?? 0) * 100));
  return (
    <div className="pb-44">
      <div className="flex items-center gap-3 px-4 pt-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-teal text-lg font-extrabold text-white">{home.data?.level ?? 1}</span>
        <div className="h-3.5 flex-1 overflow-hidden rounded-pill bg-lav" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100} aria-label="Kemajuan level"><div className="h-full rounded-pill bg-teal" style={{ width: `${pct}%` }} /></div>
        <span className="flex items-center gap-1 text-lg font-extrabold"><NavStar size={26} className="text-gold" />{home.data?.xp ?? 0}</span>
      </div>

      <div className="flex items-center gap-2 px-4 pt-3">
        <button type="button" aria-label="Kembali" onClick={() => nav("/")} className="-ml-2 flex h-11 w-11 items-center justify-center text-brand">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg>
        </button>
        <Link to="/quran/daftar" className="min-w-0 flex-1" aria-label="Pilih surat lain">
          <h1 className="text-2xl font-extrabold leading-tight text-outline">{surah?.name_id ?? "Memuat…"} <span className="text-base text-brand">▾</span></h1>
          <p className="text-sm font-semibold text-muted">{surah ? `${surah.ayah_count} ayat, Juz ${surah.juz_number}` : ""}</p>
        </Link>
        <p className="font-quran text-3xl text-brand" dir="rtl" lang="ar">{surah?.name_ar}</p>
      </div>

      <div className="mt-3 flex items-center gap-3 px-4">
        <div className="min-w-0 flex-1"><p className="font-extrabold text-outline">Ikuti bacaanku</p><p className="text-sm font-semibold text-muted">Ayat ikut tersorot, tanpa penilaian</p></div>
        <Toggle on={follow} onChange={setFollow} label="Ikuti bacaanku" />
      </div>

      <div className="mx-4 mt-3 space-y-1 rounded-[28px] bg-brand-light p-3">
        {ayahs.isLoading && <p className="p-4 text-center font-bold text-muted">Memuat ayat…</p>}
        {ayahs.isError && <p className="p-4 text-center font-bold text-[#B3261E]">Gagal memuat ayat. Periksa koneksi.</p>}
        {list.map((a, i) => (
          <button key={a.ayah_number} id={`ay-${i}`} type="button" onClick={() => play(i)} aria-label={`Putar ayat ${a.ayah_number}`}
            className={`flex w-full items-center gap-3 rounded-[20px] px-3 py-3 text-right ${follow && i === idx ? "bg-cream" : ""}`}>
            <span dir="rtl" lang="ar" className="min-w-0 flex-1 font-quran text-[1.7rem] leading-[2.1] text-outline">{a.text_uthmani}</span>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-brand text-sm font-extrabold text-brand" aria-hidden="true">{arabicDigits(a.ayah_number)}</span>
          </button>
        ))}
      </div>

      <div className="fixed bottom-[76px] left-1/2 z-30 w-full max-w-game -translate-x-1/2 px-4">
        <div className="flex items-center gap-3 rounded-pill bg-brand p-2 pr-4 text-white">
          <button type="button" onClick={toggle} aria-label={playing ? "Jeda" : "Putar"} disabled={!list.length}
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white text-brand disabled:opacity-50">
            {playing ? <span className="flex gap-1" aria-hidden="true"><i className="h-5 w-1.5 rounded bg-brand" /><i className="h-5 w-1.5 rounded bg-brand" /></span> : <NavPlay size={26} />}
          </button>
          <div className="min-w-0 flex-1"><p className="font-extrabold">Ayat {list[idx]?.ayah_number ?? 1} dari {list.length || surah?.ayah_count || "…"}</p><p className="truncate text-sm font-semibold opacity-90">Qari: {QARI[prefs.reciterId] ?? prefs.reciterId.replace(/_/g, " ")}</p></div>
          <button type="button" onClick={cycleRate} aria-label="Kecepatan" className="min-h-[40px] rounded-pill bg-white px-3 font-extrabold text-brand">{RATES[rateI]}x</button>
        </div>
      </div>
    </div>
  );
}
