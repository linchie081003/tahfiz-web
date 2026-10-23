import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { api, type HomeData } from "../lib/api";
import { surahKind, surahName } from "../lib/surahInfo";
import { loadTilawah, useTilawahSync, pagesRead, recordAyah, toggleBookmark } from "../lib/tilawahProgress";
import { NavPlay, NavStar } from "../components/icons/NavIcons";
import { Toggle } from "../components/ui/ui";
import { QuranWords } from "../components/QuranWords";
import { TajweedLegend } from "../components/TajweedLegend";

type SurahMeta = { id: number; name_ar: string; name_id: string; ayah_count: number; juz_number: number };
type Ayah = { ayah_number: number; text_uthmani: string; text_tajweed?: string | null; audio_url: string | null };
export const LAST_SURAH_KEY = "hafiz_last_surah";
const RATES = [1, 0.75, 1.25];
const arabicDigits = (n: number) => String(n).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[Number(d)]);

/** Tilawah: baca surat dengan bacaan qori; ayat ikut tersorot, tanpa penilaian. */
export function QuranSurahPage() {
  const { surahId: p } = useParams();
  const nav = useNavigate();
  const [sp] = useSearchParams();
  const [, bump] = useState(0);
  const surahId = Number(p);
  const valid = Number.isFinite(surahId) && surahId >= 1 && surahId <= 114;
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [follow, setFollow] = useState(true);
  const [rateI, setRateI] = useState(0);
  const audio = useRef<HTMLAudioElement | null>(null);

  const session = useQuery({ queryKey: ["session"], queryFn: () => api<{ role: string; member_id?: string | null }>("/auth/session"), staleTime: 60_000 });
  const isParent = session.data?.role === "parent" && !session.data?.member_id;
  const home = useQuery({ queryKey: ["home"], queryFn: () => api<HomeData>("/home"), enabled: session.isSuccess && !isParent });
  const meta = useQuery({ queryKey: ["quran", "surahs", "all"], queryFn: () => api<SurahMeta[]>("/quran/surahs"), enabled: valid });
  const ayahs = useQuery({ queryKey: ["quran", "ayahs", surahId, "tilawah"], queryFn: () => api<Ayah[]>(`/quran/surahs/${surahId}/ayahs?purpose=tilawah`), enabled: valid });
  const surah = meta.data?.find((s) => s.id === surahId);
  const list = ayahs.data ?? [];

  useEffect(() => { if (valid) try { localStorage.setItem(LAST_SURAH_KEY, String(surahId)); } catch { /* abaikan */ } }, [surahId, valid]);
  useEffect(() => { const a = Number(sp.get("ayat")); setIdx(a > 1 ? a - 1 : 0); setPlaying(false); audio.current?.pause(); }, [surahId, sp]);
  useEffect(() => { const f = () => bump((n) => n + 1); window.addEventListener("hafiz_tilawah_changed", f); return () => window.removeEventListener("hafiz_tilawah_changed", f); }, []);
  const offset = (meta.data ?? []).filter((s) => s.id < surahId).reduce((a, s) => a + s.ayah_count, 0);
  useTilawahSync();
  const bm = loadTilawah().bookmark;
  const marked = bm?.surah === surahId ? bm.ayah : 0;
  const curAyah = list[idx]?.ayah_number ?? 0;
  const mark = (i: number) => { const n = list[i]?.ayah_number; if (n) recordAyah(surahId, n, offset); };
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
    mark(i);
    void el.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  };
  const toggle = () => { if (playing) { audio.current?.pause(); setPlaying(false); } else play(idx); };
  const cycleRate = () => { const n = (rateI + 1) % RATES.length; setRateI(n); if (audio.current) audio.current.playbackRate = RATES[n]; };

  if (!valid) return <p className="p-8 text-center font-extrabold">Nomor surat tidak valid.</p>;
  const ts = loadTilawah(isParent ? 2 : 1);
  const tgt = ts.target;
  const tpct = Math.min(100, Math.round((pagesRead(ts) / tgt) * 100));
  const pct = Math.min(100, Math.max(0, (home.data?.level_progress ?? 0) * 100));
  return (
    <div className="pb-44">
      {!isParent && (
        <div className="flex items-center gap-3 px-4 pt-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-teal text-lg font-extrabold text-white">{home.data?.level ?? 1}</span>
          <div className="h-3.5 flex-1 overflow-hidden rounded-pill bg-lav" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100} aria-label="Kemajuan level"><div className="h-full rounded-pill bg-teal" style={{ width: `${pct}%` }} /></div>
          <span className="flex items-center gap-1 text-lg font-extrabold"><NavStar size={26} className="text-gold" />{home.data?.xp ?? 0}</span>
        </div>
      )}
      <div className="flex items-center gap-2 px-4 pt-3">
        <button type="button" aria-label="Kembali" onClick={() => nav("/")} className="-ml-2 flex h-11 w-11 items-center justify-center text-brand">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg>
        </button>
        <Link to="/quran/daftar" className="min-w-0 flex-1" aria-label="Pilih surat lain">
          <h1 className="text-2xl font-extrabold leading-tight text-outline">{surah ? surahName(surah.id, surah.name_id) : "Memuat…"} <span className="text-base text-brand">▾</span></h1>
          <p className="text-sm font-semibold text-muted">{surah ? `${surah.ayah_count} ayat, ${surahKind(surah.id)}` : ""}</p>
        </Link>
        <p className="font-quran text-3xl text-brand" dir="rtl" lang="ar">{surah?.name_ar}</p>
      </div>

      <div className="mx-4 mt-3 flex items-center gap-3 rounded-pill bg-brand px-5 py-3 text-white">
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-extrabold">Target hari ini: {tgt} halaman</p>
          <div className="mt-1.5 h-2 rounded bg-white/30" role="img" aria-label={`${tpct} persen`}><div className="h-2 rounded bg-gold" style={{ width: `${tpct}%` }} /></div>
        </div>
        <span className="font-extrabold">{tpct}%</span>
      </div>

      <div className="mt-3 flex items-center gap-3 px-4">
        <div className="min-w-0 flex-1"><p className="font-extrabold text-outline">Ikuti bacaanku</p><p className="text-sm font-semibold text-muted">Ayat ikut tersorot, tanpa penilaian</p></div>
        <Toggle on={follow} onChange={setFollow} label="Ikuti bacaanku" />
      </div>

      <div className="mx-4 mt-3 space-y-0.5 rounded-[28px] bg-brand-light px-4 py-3" dir="rtl">
        {ayahs.isLoading && <p className="p-4 text-center font-bold text-muted">Memuat ayat…</p>}
        {ayahs.isError && <p className="p-4 text-center font-bold text-[#B3261E]">Gagal memuat ayat. Periksa koneksi.</p>}
        {list.map((a, i) => (
          <button key={a.ayah_number} id={`ay-${i}`} type="button" onClick={() => play(i)} aria-label={`Putar ayat ${a.ayah_number}`} dir="rtl" lang="ar"
            className={`w-full rounded-[14px] px-2 text-right text-outline ${follow && i === idx ? "bg-cream" : ""}`}>
            <QuranWords textUthmani={a.text_uthmani} textTajweed={a.text_tajweed} className="text-[2rem] leading-[2.5]" />{" "}
            {marked === a.ayah_number && <span className="ml-1 rounded-pill bg-gold px-2 py-0.5 align-middle font-sans text-xs font-extrabold text-gold-ink" dir="ltr">Ditandai</span>}{" "}
            <span className="inline-flex h-[26px] w-[26px] items-center justify-center rounded-full border-[1.5px] border-brand align-middle text-[13px] leading-none text-brand" aria-hidden="true">{arabicDigits(a.ayah_number)}</span>
          </button>
        ))}
      </div>

      <div className="mx-4 mt-3"><TajweedLegend tone="dark" /></div>

      <div className="fixed bottom-[76px] left-1/2 z-30 w-full max-w-game -translate-x-1/2 px-4">
        <div className="flex items-center gap-3 rounded-pill bg-brand p-2 pr-4 text-white">
          <button type="button" onClick={toggle} aria-label={playing ? "Jeda" : "Putar"} disabled={!list.length}
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white text-brand disabled:opacity-50">
            {playing ? <span className="flex gap-1" aria-hidden="true"><i className="h-5 w-1.5 rounded bg-brand" /><i className="h-5 w-1.5 rounded bg-brand" /></span> : <NavPlay size={26} />}
          </button>
          <div className="min-w-0 flex-1"><p className="font-extrabold">Ayat {list[idx]?.ayah_number ?? 1} dari {list.length || surah?.ayah_count || "…"}</p><p className="truncate text-sm font-semibold opacity-90">Qari: Mishary Rashid Alafasy</p></div>
          <button type="button" onClick={() => curAyah && toggleBookmark(surahId, curAyah)} disabled={!curAyah} aria-pressed={marked === curAyah && !!curAyah} aria-label={marked === curAyah ? "Lepas tanda ayat" : "Tandai ayat terakhir"}
            className={`flex min-h-[40px] items-center gap-1 rounded-pill px-3 font-extrabold ${marked === curAyah && curAyah ? "bg-gold text-gold-ink" : "bg-white text-brand"}`}>
            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M6 3h12v18l-6-4-6 4z" fill={marked === curAyah && curAyah ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" /></svg>Tandai
          </button>
          <button type="button" onClick={cycleRate} aria-label="Kecepatan" className="min-h-[40px] rounded-pill bg-white px-3 font-extrabold text-brand">{RATES[rateI]}x</button>
        </div>
      </div>
    </div>
  );
}
