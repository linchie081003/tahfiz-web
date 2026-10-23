import { useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Btn, Card, Chip, Page, ScreenHead } from "../components/ui/ui";
import { QuranWords } from "../components/QuranWords";
import { MarkPanel, useMarks } from "../components/MarkPanel";
import { SambungAyat } from "../components/SambungAyat";
import { NavPlay } from "../components/icons/NavIcons";
import { api, type HomeData } from "../lib/api";
import { loadQuranPrefs } from "../lib/quranPrefs";

type SItem = { id: string; ayah_start: number; ayah_end: number };
type Block = { surah_id: number; surah_name: string; ayah_start: number; ayah_end: number; items: SItem[] };
type Sesi = { active: boolean; max_ayah: number; total_ayah: number; blocks: Block[] };
type Ayah = { ayah_number: number; text_uthmani: string; text_tajweed?: string | null; audio_url: string | null };
type Rating = "lancar" | "ragu" | "lupa";

const RATINGS: { id: Rating; label: string; cls: string }[] = [
  { id: "lancar", label: "Lancar", cls: "bg-teal text-white" },
  { id: "ragu", label: "Ragu", cls: "bg-gold text-gold-ink" },
  { id: "lupa", label: "Lupa", cls: "bg-coral text-white" },
];
const RANK: Record<Rating, number> = { lancar: 0, ragu: 1, lupa: 2 };
const LEVEL: Record<Rating, string> = { lancar: "Kuat", ragu: "Cukup", lupa: "Lemah" };
type Mode = "semua" | "sebagian";

/** Nilai rentang ditentukan ayat terlemahnya: satu "Lupa" berarti Lemah, "Ragu" tanpa "Lupa" berarti Cukup. */
export function rangeRating(results: Rating[]): Rating {
  return results.reduce<Rating>((w, r) => (RANK[r] > RANK[w] ? r : w), "lancar");
}

/** Sesi 1: murajaah hafalan lama. Ayat disembunyikan dulu, anak melihat ayat lalu menandai keyakinannya. */
export function MurojaahPage() {
  const nav = useNavigate();
  const qc = useQueryClient();
  const prefs = loadQuranPrefs();
  const home = useQuery({ queryKey: ["home"], queryFn: () => api<HomeData>("/home") });
  const sesi3 = useQuery({ queryKey: ["sesi3-aktif"], queryFn: () => api<{ active: boolean }>("/sesi3") });
  const sesi = useQuery({ queryKey: ["murojaah-sesi"], queryFn: () => api<Sesi>("/murojaah/sesi") });
  const [started, setStarted] = useState(false);
  const [pos, setPos] = useState(0);
  const [peek, setPeek] = useState(false);
  const [results, setResults] = useState<Record<string, Rating>>({}); // kunci "surat:ayat"
  const [saved, setSaved] = useState<{ name: string; range: string; rating: Rating }[] | null>(null);
  const [sambung, setSambung] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [mode, setMode] = useState<Mode>(home.data?.age_mode === "paud" ? "sebagian" : "semua");
  const audio = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  const blocks = sesi.data?.blocks ?? [];
  const surahIds = useMemo(() => [...new Set(blocks.map((b) => b.surah_id))], [blocks]);
  const ayahQs = useQueries({
    queries: surahIds.map((id) => ({
      queryKey: ["ayahs", id, prefs.reciterId],
      queryFn: () => api<Ayah[]>(`/quran/surahs/${id}/ayahs?reciter_id=${prefs.reciterId}`),
    })),
  });
  const ayahBySurah = useMemo(() => {
    const m: Record<number, Ayah[]> = {};
    surahIds.forEach((id, i) => { m[id] = ayahQs[i]?.data ?? []; });
    return m;
  }, [surahIds, ayahQs]);
  const flat = useMemo(
    () => blocks.flatMap((b) => Array.from({ length: b.ayah_end - b.ayah_start + 1 }, (_, i) => ({ surah_id: b.surah_id, name: b.surah_name, no: b.ayah_start + i }))),
    [blocks],
  );
  const cur = flat[pos];
  const ayah = cur ? ayahBySurah[cur.surah_id]?.find((a) => a.ayah_number === cur.no) : undefined;
  const words = useMemo(() => (ayah?.text_uthmani ?? "").split(/\s+/).filter(Boolean), [ayah]);
  const hideIdx = useMemo(() => {
    const showFirst = mode === "sebagian" ? Math.max(1, Math.floor(words.length / 3)) : 0;
    return new Set(words.map((_, i) => i).filter((i) => i >= showFirst));
  }, [words, mode]);

  useEffect(() => { setPeek(false); setPlaying(false); audio.current?.pause(); }, [pos, started]);
  useEffect(() => () => audio.current?.pause(), []);

  const play = () => {
    if (!ayah?.audio_url) return;
    const el = audio.current ?? (audio.current = new Audio());
    if (playing) { el.pause(); setPlaying(false); return; }
    el.src = ayah.audio_url;
    el.onended = () => setPlaying(false);
    el.onerror = () => setPlaying(false);
    void el.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  };

  const finish = async (all: Record<string, Rating>) => {
    setSaveError("");
    try {
      // hasil per ayat disimpan dulu (sumber tanda otomatis), lalu nilai tiap rentang ke jadwal murajaah
      await api("/latihan", {
        method: "POST",
        body: JSON.stringify({ kind: "murajaah", results: Object.entries(all).map(([k, result]) => { const [s, n] = k.split(":"); return { surah_id: Number(s), ayah_number: Number(n), result }; }) }),
      });
    } catch {
      setSaveError("Hasil belum tersimpan. Periksa koneksi lalu coba lagi.");
      return;
    }
    const done: { name: string; range: string; rating: Rating }[] = [];
    for (const b of blocks) {
      for (const it of b.items) {
        const rs: Rating[] = [];
        for (let n = it.ayah_start; n <= it.ayah_end; n++) rs.push(all[`${b.surah_id}:${n}`] ?? "lupa");
        const rating = rangeRating(rs);
        await api(`/murojaah/${it.id}/complete`, { method: "POST", body: JSON.stringify({ rating }) });
        done.push({ name: b.surah_name, range: `ayat ${it.ayah_start}–${it.ayah_end}`, rating });
      }
    }
    setSaved(done);
    qc.invalidateQueries({ queryKey: ["murojaah-sesi"] });
    qc.invalidateQueries({ queryKey: ["home"] });
  };

  const choose = (r: Rating) => {
    if (!cur) return;
    const next = { ...results, [`${cur.surah_id}:${cur.no}`]: r };
    setResults(next);
    if (pos >= flat.length - 1) void finish(next);
    else setPos(pos + 1);
  };

  const marksQ = useMarks(cur?.surah_id ?? 0);
  const curMarked = (marksQ.data ?? []).some((m) => m.ayah_number === cur?.no);

  if (saved && sambung) {
    return (
      <Page>
        <SambungAyat onDone={() => nav("/")} />
      </Page>
    );
  }
  if (saved) {
    const strong = saved.filter((d) => d.rating === "lancar").length;
    const when = (r: Rating) => (r === "lancar" ? "Ulang lagi sesuai jadwal Kuat" : r === "ragu" ? "Ulang lagi 7 hari (Cukup)" : "Ulang lagi besok");
    return (
      <Page>
        <ScreenHead back={false} eyebrow="Hasil murajaah" title="Murajaah selesai!" sub={`${strong} rentang kuat, ${saved.length - strong} perlu diulang`} />
        {saved.map((d, i) => (
          <Card key={i} tone="lav">
            <div className="flex items-center gap-2"><p className="min-w-0 flex-1 text-lg font-extrabold">{d.name}, {d.range}</p><Chip tone={d.rating === "lancar" ? "teal" : d.rating === "ragu" ? "gold" : "coral"}>{LEVEL[d.rating]}</Chip></div>
            <p className="text-sm font-semibold text-muted">{when(d.rating)}</p>
          </Card>
        ))}
        <p className="text-center text-sm font-bold text-muted">Ini penilaianmu sendiri untuk latihan. Guru atau orang tua yang memutuskan kelulusan hafalan.</p>
        <Btn onClick={() => setSambung(true)}>Main sambung ayat (bonus XP)</Btn>
        {sesi3.data?.active && <Btn onClick={() => nav("/sesi3")}>Lanjut Sesi 3: penguatan ayat baru</Btn>}
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
            <h1 className="text-[22px] font-extrabold leading-tight text-outline">{cur.name}, ayat {cur.no}</h1>
            <p className="text-sm font-semibold text-muted">Ayat {pos + 1} dari {flat.length}</p>
          </div>
        </header>
        <div className="flex gap-1.5" role="img" aria-label={`${pos} dari ${flat.length} ayat selesai`}>
          {flat.map((_, i) => <span key={i} className={`h-2 flex-1 rounded ${i < pos ? "bg-gold" : i === pos ? "bg-brand" : "bg-[#E4E4EE]"}`} />)}
        </div>
        <div className="flex gap-1 rounded-pill bg-[#E3E0EE] p-1" role="group" aria-label="Cara menyembunyikan ayat">
          {(["semua", "sebagian"] as Mode[]).map((m) => (
            <button key={m} type="button" aria-pressed={mode === m} onClick={() => setMode(m)} className={`flex h-10 flex-1 items-center justify-center rounded-pill text-sm font-extrabold ${mode === m ? "bg-brand text-white" : "text-brand-dark"}`}>
              {m === "semua" ? "Sembunyikan semua" : "Sebagian terlihat"}
            </button>
          ))}
        </div>
        <section className="rounded-[28px] bg-brand-light p-4 text-center">
          {ayah ? (
            <p className="block"><QuranWords textUthmani={ayah.text_uthmani} textTajweed={ayah.text_tajweed} hidden={hideIdx} peek={peek} className="text-[2.6rem] leading-[2.5]" /></p>
          ) : (
            <p className="text-sm font-semibold text-muted">Memuat ayat…</p>
          )}
          {!peek && <p className="mt-2 text-sm font-bold text-outline">Lantunkan dari ingatan, lalu tekan Lihat ayat.</p>}
          {curMarked && <p className="mt-1 text-sm font-extrabold text-gold-ink">★ Ayat ini pernah terasa sulit</p>}
        </section>
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={play} disabled={!ayah?.audio_url} className="flex min-h-[48px] items-center justify-center gap-2 rounded-pill bg-lav text-[15px] font-extrabold text-brand-dark disabled:opacity-50"><NavPlay size={18} />{playing ? "Hentikan" : "Putar audio"}</button>
          <button type="button" onClick={() => setPeek(true)} disabled={peek || !ayah} className="min-h-[48px] rounded-pill bg-brand text-[15px] font-extrabold text-white disabled:opacity-50">Lihat ayat</button>
        </div>
        {peek && (
          <div className="space-y-2">
            <p className="text-sm font-bold text-outline">Seberapa yakin tadi?</p>
            <div className="grid grid-cols-3 gap-2">
              {RATINGS.map((r) => (
                <button key={r.id} type="button" onClick={() => choose(r.id)} className={`min-h-[56px] rounded-[22px] px-2 text-base font-extrabold ${r.cls}`}>{r.label}</button>
              ))}
            </div>
          </div>
        )}
        {ayah && <MarkPanel surahId={cur.surah_id} ayahNo={cur.no} text={ayah.text_uthmani} />}
        {saveError && <p role="alert" className="text-sm font-bold text-coral">{saveError}</p>}
        {pos > 0 && <button type="button" onClick={() => setPos(pos - 1)} className="self-start text-sm font-extrabold text-brand-dark">‹ Ayat sebelumnya</button>}
      </div>
    );
  }

  return (
    <Page>
      <ScreenHead back eyebrow="Sesi 1" title="Murajaah" sub="Ulangi hafalan lamamu supaya tetap kuat" />
      <div className="flex gap-1 rounded-pill bg-[#E3E0EE] p-1">
        <span aria-current="page" className="flex h-11 flex-1 items-center justify-center rounded-pill bg-brand text-[15px] font-extrabold text-white">Murajaah</span>
        <button type="button" onClick={() => nav("/ziyadah")} className="flex h-11 flex-1 items-center justify-center rounded-pill text-[15px] font-extrabold text-brand-dark">Hafalan baru</button>
      </div>
      {sesi.isLoading && <p className="text-sm font-semibold text-muted">Memuat…</p>}
      {sesi.data && !sesi.data.active && (
        <Card tone="lav"><p className="text-base font-extrabold">Belum ada hafalan untuk diulang</p><p className="text-sm font-semibold text-muted">Murajaah muncul setelah ada ayat yang dinyatakan lulus oleh guru atau orang tua. Mulai dari Hafalan baru dulu ya.</p></Card>
      )}
      {sesi.data?.active && blocks.length === 0 && (
        <Card tone="lav"><p className="text-base font-extrabold">Tidak ada murajaah hari ini</p><p className="text-sm font-semibold text-muted">Hebat, sampai jumpa besok!</p></Card>
      )}
      {sesi3.data?.active && (
        <button type="button" onClick={() => nav("/sesi3")} className="flex min-h-[56px] w-full items-center justify-between rounded-[22px] bg-lav px-4 text-left font-extrabold text-brand-dark"><span>Sesi 3: penguatan ayat baru</span><span aria-hidden="true">›</span></button>
      )}
      {blocks.length > 0 && (
        <section className="space-y-2.5 rounded-[28px] bg-brand p-4 text-white">
          <div className="flex items-center justify-between"><h2 className="text-lg font-extrabold">Murajaah hari ini</h2><span className="text-[13px] font-bold text-lav">{sesi.data?.total_ayah} ayat</span></div>
          <ul className="space-y-1">
            {blocks.map((b, i) => <li key={i} className="text-sm font-bold text-lav">{b.surah_name}, ayat {b.ayah_start}–{b.ayah_end}</li>)}
          </ul>
          <button type="button" onClick={() => { setPos(0); setResults({}); setStarted(true); }} className="flex h-14 w-full items-center justify-center gap-2 rounded-pill bg-white text-[17px] font-extrabold text-brand-dark"><NavPlay size={20} />Mulai murajaah</button>
        </section>
      )}
    </Page>
  );
}
