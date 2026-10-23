import { useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useRef, useState } from "react";
import { Btn, Card, Chip } from "./ui/ui";
import { api } from "../lib/api";
import { loadQuranPrefs } from "../lib/quranPrefs";

type Opt = { surah_id: number; ayah_number: number };
type Q = { surah_id: number; surah_name: string; ayah_from: number; mode: "ingat" | "pilihan"; options: Opt[] | null };
type Ayah = { ayah_number: number; text_uthmani: string; audio_url: string | null };
type Rating = "lancar" | "ragu" | "lupa";
const RATINGS: { id: Rating; label: string; cls: string }[] = [
  { id: "lancar", label: "Lancar", cls: "bg-teal text-white" },
  { id: "ragu", label: "Ragu", cls: "bg-gold text-gold-ink" },
  { id: "lupa", label: "Lupa", cls: "bg-coral text-white" },
];

/** Sambung ayat: bonus XP, bukan syarat selesai sesi. Anak melanjutkan ayat berikutnya dari ingatan. */
export function SambungAyat({ onDone }: { onDone: () => void }) {
  const qc = useQueryClient();
  const prefs = loadQuranPrefs();
  const qs = useQuery({ queryKey: ["sambung"], queryFn: () => api<{ questions: Q[] }>("/sambung"), staleTime: 0, gcTime: 0 });
  const questions = qs.data?.questions ?? [];
  const surahIds = useMemo(() => {
    const s = new Set<number>();
    questions.forEach((q) => { s.add(q.surah_id); q.options?.forEach((o) => s.add(o.surah_id)); });
    return [...s];
  }, [questions]);
  const ayahQs = useQueries({ queries: surahIds.map((id) => ({ queryKey: ["ayahs", id, prefs.reciterId], queryFn: () => api<Ayah[]>(`/quran/surahs/${id}/ayahs?reciter_id=${prefs.reciterId}`) })) });
  const text = (sid: number, no: number) => ayahQs[surahIds.indexOf(sid)]?.data?.find((a) => a.ayah_number === no);
  const [i, setI] = useState(0);
  const [reveal, setReveal] = useState(false);
  const [feedback, setFeedback] = useState<{ correct: boolean | null; rewarded: boolean } | null>(null);
  const [xp, setXp] = useState(0);
  const [error, setError] = useState("");
  const audio = useRef<HTMLAudioElement | null>(null);

  const answer = async (body: object) => {
    const q = questions[i];
    setError("");
    try {
      const r = await api<{ correct: boolean | null; rewarded: boolean }>("/sambung/jawab", { method: "POST", body: JSON.stringify({ surah_id: q.surah_id, ayah_from: q.ayah_from, mode: q.mode, ...body }) });
      setFeedback(r);
      if (r.rewarded) setXp((x) => x + 1);
    } catch {
      setError("Jawaban belum tersimpan. Coba lagi.");
    }
  };
  const next = () => {
    setFeedback(null); setReveal(false);
    if (i + 1 >= questions.length) { qc.invalidateQueries({ queryKey: ["home"] }); setI(questions.length); } else setI(i + 1);
  };
  const play = (url: string | null | undefined) => {
    if (!url) return;
    const el = audio.current ?? (audio.current = new Audio());
    el.src = url; void el.play().catch(() => undefined);
  };

  if (qs.isLoading) return <p className="text-sm font-semibold text-muted">Menyiapkan soal…</p>;
  if (!questions.length) return <Card tone="lav"><p className="font-extrabold">Belum ada soal sambung ayat</p><p className="text-sm font-semibold text-muted">Soal muncul setelah ada dua ayat berurutan yang sudah lulus.</p><Btn onClick={onDone}>Selesai</Btn></Card>;
  if (i >= questions.length) return <Card tone="lav"><p className="text-lg font-extrabold">Sambung ayat selesai!</p><p className="text-sm font-semibold text-muted">{xp > 0 ? `Bonus XP didapat dari ${xp} soal.` : "Bonus XP hari ini sudah penuh."}</p><Btn onClick={onDone}>Selesai</Btn></Card>;

  const q = questions[i];
  const given = text(q.surah_id, q.ayah_from);
  const target = text(q.surah_id, q.ayah_from + 1);
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between"><h2 className="text-lg font-extrabold text-outline">Sambung ayat</h2><Chip tone="lav">Soal {i + 1} dari {questions.length}</Chip></div>
      <Card tone="lav" className="space-y-2 text-center">
        <p className="text-sm font-bold text-muted">{q.surah_name}, ayat {q.ayah_from}</p>
        <p dir="rtl" lang="ar" className="quran-ayah text-[2.2rem] leading-[2.3]">{given?.text_uthmani ?? "…"}</p>
        <button type="button" onClick={() => play(given?.audio_url)} disabled={!given?.audio_url} className="min-h-[44px] rounded-pill bg-white px-4 text-sm font-extrabold text-brand-dark disabled:opacity-50">Putar ayat</button>
      </Card>
      <p className="text-center text-sm font-extrabold text-outline">Lanjutkan ke ayat berikutnya</p>
      {q.mode === "pilihan" && q.options && !feedback && (
        <div className="space-y-2">
          {q.options.map((o, k) => (
            <button key={k} type="button" onClick={() => answer({ chosen_surah_id: o.surah_id, chosen_ayah: o.ayah_number })} className="w-full rounded-[22px] bg-white p-3 text-center ring-2 ring-lav">
              <span dir="rtl" lang="ar" className="quran-ayah block text-[1.8rem] leading-[2.2]">{text(o.surah_id, o.ayah_number)?.text_uthmani ?? "…"}</span>
            </button>
          ))}
        </div>
      )}
      {q.mode === "ingat" && !reveal && !feedback && <Btn onClick={() => setReveal(true)}>Lihat jawaban</Btn>}
      {q.mode === "ingat" && reveal && !feedback && (
        <div className="space-y-2">
          <Card tone="lav" className="text-center"><p dir="rtl" lang="ar" className="quran-ayah text-[2.2rem] leading-[2.3]">{target?.text_uthmani ?? "…"}</p><button type="button" onClick={() => play(target?.audio_url)} disabled={!target?.audio_url} className="mt-1 min-h-[44px] rounded-pill bg-white px-4 text-sm font-extrabold text-brand-dark disabled:opacity-50">Putar ayat</button></Card>
          <p className="text-sm font-bold text-outline">Seberapa yakin tadi?</p>
          <div className="grid grid-cols-3 gap-2">{RATINGS.map((r) => <button key={r.id} type="button" onClick={() => answer({ result: r.id })} className={`min-h-[56px] rounded-[22px] text-base font-extrabold ${r.cls}`}>{r.label}</button>)}</div>
        </div>
      )}
      {feedback && (
        <div className="space-y-2">
          {q.mode === "pilihan" && <p className={`text-center text-lg font-extrabold ${feedback.correct ? "text-teal" : "text-coral"}`}>{feedback.correct ? "Benar!" : "Belum tepat. Ayat yang benar:"}</p>}
          {q.mode === "pilihan" && !feedback.correct && <Card tone="lav" className="text-center"><p dir="rtl" lang="ar" className="quran-ayah text-[2rem] leading-[2.3]">{target?.text_uthmani}</p></Card>}
          {feedback.rewarded && <p className="text-center text-sm font-extrabold text-brand-dark">+ bonus XP</p>}
          <Btn onClick={next}>{i + 1 >= questions.length ? "Selesai" : "Soal berikutnya"}</Btn>
        </div>
      )}
      {error && <p role="alert" className="text-sm font-bold text-coral">{error}</p>}
    </section>
  );
}
