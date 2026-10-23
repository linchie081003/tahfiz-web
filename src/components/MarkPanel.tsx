import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "../lib/api";

export type Mark = {
  id: string; surah_id: number; ayah_number: number; word_start: number | null; word_end: number | null;
  word_text: string | null; source: string; created_by_role: string;
};

/** Hook tanda sulit untuk satu surat. Tanda hanya mengatur prioritas latihan, tidak mengubah kelulusan. */
export function useMarks(surahId: number) {
  return useQuery({ queryKey: ["tanda", surahId], queryFn: () => api<Mark[]>(`/tanda?surah_id=${surahId}`), enabled: surahId > 0 });
}

/** Tombol tandai ayat sulit dan pemilih kata sulit untuk satu ayat. */
export function MarkPanel({ surahId, ayahNo, text }: { surahId: number; ayahNo: number; text: string }) {
  const qc = useQueryClient();
  const { data } = useMarks(surahId);
  const [pick, setPick] = useState(false);
  const [sel, setSel] = useState<[number, number] | null>(null);
  const [error, setError] = useState("");
  const words = text.split(/\s+/).filter(Boolean);
  const here = (data ?? []).filter((m) => m.ayah_number === ayahNo);
  const ayatMark = here.find((m) => m.word_start === null);
  const wordMarks = here.filter((m) => m.word_start !== null);
  const refresh = () => qc.invalidateQueries({ queryKey: ["tanda", surahId] });
  const add = useMutation({
    mutationFn: (body: { word_start?: number; word_end?: number }) =>
      api("/tanda", { method: "POST", body: JSON.stringify({ surah_id: surahId, ayah_number: ayahNo, ...body }) }),
    onSuccess: () => { setError(""); setSel(null); setPick(false); refresh(); },
    onError: () => setError("Tanda belum tersimpan. Coba lagi."),
  });
  const remove = useMutation({
    mutationFn: (id: string) => api(`/tanda/${id}/nonaktif`, { method: "POST" }),
    onSuccess: refresh,
    onError: () => setError("Tanda belum terhapus. Coba lagi."),
  });
  const tapWord = (i: number) => setSel((s) => (!s || s[0] !== s[1] ? [i, i] : [Math.min(s[0], i), Math.max(s[0], i)]));

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {ayatMark ? (
          <button type="button" onClick={() => remove.mutate(ayatMark.id)} disabled={ayatMark.created_by_role !== "child"} aria-pressed="true"
            className="min-h-[44px] rounded-pill bg-gold px-4 text-sm font-extrabold text-gold-ink disabled:opacity-70">
            ★ Ayat sulit{ayatMark.source === "auto" ? " (otomatis)" : ""} · hapus
          </button>
        ) : (
          <button type="button" onClick={() => add.mutate({})} disabled={add.isPending} className="min-h-[44px] rounded-pill bg-cream px-4 text-sm font-extrabold text-gold-ink">☆ Tandai ayat sulit</button>
        )}
        <button type="button" onClick={() => { setPick((p) => !p); setSel(null); }} aria-expanded={pick} className="min-h-[44px] rounded-pill bg-lav px-4 text-sm font-extrabold text-brand-dark">Tandai kata sulit</button>
      </div>
      {wordMarks.length > 0 && (
        <ul className="flex flex-wrap gap-2" aria-label="Kata sulit di ayat ini">
          {wordMarks.map((m) => (
            <li key={m.id} className="flex items-center gap-1 rounded-pill bg-cream px-3 py-1 text-sm font-extrabold text-gold-ink">
              <span dir="rtl" lang="ar" className="text-lg">{m.word_text}</span>
              {m.created_by_role === "child" && <button type="button" aria-label="Hapus tanda kata" onClick={() => remove.mutate(m.id)} className="px-1">×</button>}
            </li>
          ))}
        </ul>
      )}
      {pick && (
        <div className="space-y-2 rounded-[22px] bg-lav p-3">
          <p className="text-sm font-bold text-outline">Ketuk satu kata, atau ketuk dua kata untuk satu rangkaian.</p>
          <div dir="rtl" lang="ar" className="flex flex-wrap gap-2">
            {words.map((w, i) => {
              const on = sel ? i >= sel[0] && i <= sel[1] : false;
              return <button key={i} type="button" aria-pressed={on} onClick={() => tapWord(i)} className={`min-h-[44px] rounded-2xl px-3 text-2xl ${on ? "bg-brand text-white" : "bg-white text-outline"}`}>{w}</button>;
            })}
          </div>
          <button type="button" disabled={!sel || add.isPending} onClick={() => sel && add.mutate({ word_start: sel[0], word_end: sel[1] })} className="min-h-[44px] w-full rounded-pill bg-brand text-sm font-extrabold text-white disabled:opacity-50">Simpan tanda kata</button>
        </div>
      )}
      {error && <p role="alert" className="text-sm font-bold text-coral">{error}</p>}
    </div>
  );
}
