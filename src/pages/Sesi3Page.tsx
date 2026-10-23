import { useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Btn, Card, Chip, Page, ScreenHead } from "../components/ui/ui";
import { QuranWords } from "../components/QuranWords";
import { MarkPanel } from "../components/MarkPanel";
import { NavPlay } from "../components/icons/NavIcons";
import { api } from "../lib/api";
import { loadQuranPrefs } from "../lib/quranPrefs";

type Item = { submission_id: string; surah_id: number; surah_name: string; ayah_number: number; state: "pending" | "passed" | "remedial"; marked: boolean };
type Offer = { submission_id: string; surah_id: number; ayah_number: number; reason: string } | null;
type Sesi3 = { active: boolean; disabled_reason?: string | null; sample: Item[]; offer: Offer };
type Ayah = { ayah_number: number; text_uthmani: string; text_tajweed?: string | null; audio_url: string | null };
type Rating = "lancar" | "ragu" | "lupa";
const RATINGS: { id: Rating; label: string; cls: string }[] = [
  { id: "lancar", label: "Lancar", cls: "bg-teal text-white" },
  { id: "ragu", label: "Ragu", cls: "bg-gold text-gold-ink" },
  { id: "lupa", label: "Lupa", cls: "bg-coral text-white" },
];
const STATE: Record<Item["state"], string> = { pending: "Menunggu dinilai", passed: "Baru lulus", remedial: "Perlu diperkuat" };

/** Sesi 3: penguatan beberapa ayat dari hafalan baru. Hanya latihan: tidak menilai dan tidak meluluskan hafalan. */
export function Sesi3Page() {
  const nav = useNavigate();
  const qc = useQueryClient();
  const prefs = loadQuranPrefs();
  const s3 = useQuery({ queryKey: ["sesi3"], queryFn: () => api<Sesi3>("/sesi3"), staleTime: 0 });
  const sample = s3.data?.sample ?? [];
  const [started, setStarted] = useState(false);
  const [pos, setPos] = useState(0);
  const [peek, setPeek] = useState(false);
  const [results, setResults] = useState<Record<string, Rating>>({});
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [asked, setAsked] = useState<string | null>(null);
  const audio = useRef<HTMLAudioElement | null>(null);
  const surahIds = useMemo(() => [...new Set(sample.map((x) => x.surah_id))], [sample]);
  const ayahQs = useQueries({ queries: surahIds.map((id) => ({ queryKey: ["ayahs", id, prefs.reciterId], queryFn: () => api<Ayah[]>(`/quran/surahs/${id}/ayahs?reciter_id=${prefs.reciterId}`) })) });
  const cur = sample[pos];
  const ayah = cur ? ayahQs[surahIds.indexOf(cur.surah_id)]?.data?.find((a) => a.ayah_number === cur.ayah_number) : undefined;
  const words = useMemo(() => (ayah?.text_uthmani ?? "").split(/\s+/).filter(Boolean), [ayah]);
  const hideAll = useMemo(() => new Set(words.map((_, i) => i)), [words]);
  useEffect(() => { setPeek(false); audio.current?.pause(); }, [pos, started]);
  useEffect(() => () => audio.current?.pause(), []);

  const play = () => {
    if (!ayah?.audio_url) return;
    const el = audio.current ?? (audio.current = new Audio());
    el.src = ayah.audio_url; void el.play().catch(() => undefined);
  };
  const finish = async (all: Record<string, Rating>) => {
    setError("");
    try {
      await api("/latihan", { method: "POST", body: JSON.stringify({ kind: "penguatan", results: Object.entries(all).map(([k, result]) => { const [s, n] = k.split(":"); return { surah_id: Number(s), ayah_number: Number(n), result }; }) }) });
      qc.invalidateQueries({ queryKey: ["tanda"] });
      setDone(true);
    } catch { setError("Hasil belum tersimpan. Periksa koneksi lalu coba lagi."); }
  };
  const choose = (r: Rating) => {
    if (!cur) return;
    const next = { ...results, [`${cur.surah_id}:${cur.ayah_number}`]: r };
    setResults(next);
    if (pos >= sample.length - 1) void finish(next); else setPos(pos + 1);
  };
  const ask = async (submission_id: string, ayah_number: number) => {
    setError("");
    try { await api("/sesi3/minta", { method: "POST", body: JSON.stringify({ submission_id, ayah_number }) }); setAsked(`${submission_id}:${ayah_number}`); }
    catch { setError("Permintaan cek belum terkirim. Coba lagi nanti."); }
  };

  if (done) {
    const offer = s3.data?.offer;
    return (
      <Page>
        <ScreenHead back={false} eyebrow="Sesi 3" title="Penguatan selesai!" sub="Latihanmu tersimpan untuk membantu memilih ayat yang perlu diulang." />
        {offer && !asked && (
          <Card tone="lav" className="space-y-2">
            <p className="font-extrabold">Ayat {offer.ayah_number} masih terasa sulit</p>
            <p className="text-sm font-semibold text-muted">Mau minta guru atau orang tua mengeceknya?</p>
            <Btn onClick={() => ask(offer.submission_id, offer.ayah_number)}>Minta dicek</Btn>
          </Card>
        )}
        {asked && <Card tone="lav"><p className="font-extrabold">Permintaan terkirim</p></Card>}
        {error && <p role="alert" className="text-sm font-bold text-coral">{error}</p>}
        <p className="text-center text-sm font-bold text-muted">Ini latihan. Guru atau orang tua yang memutuskan kelulusan hafalan.</p>
        <Btn onClick={() => nav("/")}>Kembali ke beranda</Btn>
      </Page>
    );
  }

  if (started && cur) {
    return (
      <div className="app-page flex min-h-dvh flex-col gap-4 px-4 pb-28 pt-3">
        <header className="flex items-center gap-2">
          <button type="button" aria-label="Kembali" onClick={() => setStarted(false)} className="-ml-2 flex h-11 w-11 items-center justify-center text-brand">‹</button>
          <div className="min-w-0 flex-1">
            <h1 className="text-[22px] font-extrabold leading-tight text-outline">{cur.surah_name}, ayat {cur.ayah_number}</h1>
            <p className="text-sm font-semibold text-muted">Ayat {pos + 1} dari {sample.length} · {STATE[cur.state]}</p>
          </div>
        </header>
        <section className="rounded-[28px] bg-brand-light p-4 text-center">
          {ayah ? <p className="block"><QuranWords textUthmani={ayah.text_uthmani} textTajweed={ayah.text_tajweed} hidden={hideAll} peek={peek} className="text-[2.6rem] leading-[2.5]" /></p> : <p className="text-sm font-semibold text-muted">Memuat ayat…</p>}
          {!peek && <p className="mt-2 text-sm font-bold text-outline">Lantunkan dari ingatan, lalu tekan Lihat ayat.</p>}
          {cur.marked && <p className="mt-1 text-sm font-extrabold text-gold-ink">★ Ayat ini pernah terasa sulit</p>}
        </section>
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={play} disabled={!ayah?.audio_url} className="flex min-h-[48px] items-center justify-center gap-2 rounded-pill bg-lav text-[15px] font-extrabold text-brand-dark disabled:opacity-50"><NavPlay size={18} />Putar audio</button>
          <button type="button" onClick={() => setPeek(true)} disabled={peek || !ayah} className="min-h-[48px] rounded-pill bg-brand text-[15px] font-extrabold text-white disabled:opacity-50">Lihat ayat</button>
        </div>
        {peek && (
          <div className="space-y-2">
            <p className="text-sm font-bold text-outline">Seberapa yakin tadi?</p>
            <div className="grid grid-cols-3 gap-2">{RATINGS.map((r) => <button key={r.id} type="button" onClick={() => choose(r.id)} className={`min-h-[56px] rounded-[22px] px-2 text-base font-extrabold ${r.cls}`}>{r.label}</button>)}</div>
          </div>
        )}
        {ayah && <MarkPanel surahId={cur.surah_id} ayahNo={cur.ayah_number} text={ayah.text_uthmani} />}
        {error && <p role="alert" className="text-sm font-bold text-coral">{error}</p>}
        {pos > 0 && <button type="button" onClick={() => setPos(pos - 1)} className="self-start text-sm font-extrabold text-brand-dark">‹ Ayat sebelumnya</button>}
      </div>
    );
  }

  return (
    <Page>
      <ScreenHead back eyebrow="Sesi 3" title="Penguatan" sub="Perkuat beberapa ayat dari hafalan barumu" />
      {s3.isLoading && <p className="text-sm font-semibold text-muted">Memuat…</p>}
      {s3.data && !s3.data.active && <Card tone="lav"><p className="text-base font-extrabold">{s3.data.disabled_reason ? "Sesi ini dimatikan orang tua hari ini" : "Belum ada yang perlu diperkuat"}</p><p className="text-sm font-semibold text-muted">{s3.data.disabled_reason ?? "Sesi ini muncul setelah kamu menyetor hafalan baru."}</p></Card>}
      {sample.length > 0 && (
        <section className="space-y-2.5 rounded-[28px] bg-brand p-4 text-white">
          <h2 className="text-lg font-extrabold">Ayat pilihan hari ini</h2>
          <ul className="space-y-1.5">
            {sample.map((x, i) => <li key={i} className="flex items-center justify-between text-sm font-bold text-lav"><span>{x.surah_name}, ayat {x.ayah_number}</span><Chip tone={x.state === "remedial" ? "coral" : x.state === "passed" ? "teal" : "gold"}>{STATE[x.state]}</Chip></li>)}
          </ul>
          <button type="button" onClick={() => { setPos(0); setResults({}); setStarted(true); }} className="flex h-14 w-full items-center justify-center gap-2 rounded-pill bg-white text-[17px] font-extrabold text-brand-dark"><NavPlay size={20} />Mulai penguatan</button>
        </section>
      )}
    </Page>
  );
}
