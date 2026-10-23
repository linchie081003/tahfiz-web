import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "../lib/api";

type Req = {
  id: string; member_id: string; member_name: string; reason: string; surah_id: number; surah_name: string;
  ayah_start: number | null; ayah_end: number | null; ayah_number: number | null;
  marks: { id: string; ayah_number: number; word_text: string | null; created_by_role: string }[];
};
const REASON: Record<string, string> = { child_mark: "Anak meminta dicek", correction: "Perlu perbaikan, cek lanjutan", parent_request: "Diminta orang tua" };

/** Permintaan cek dari Sesi 3 untuk orang tua atau guru. Menandai ayat sulit atau menyatakan selesai dicek; tidak mengubah kelulusan. */
export function PermintaanCek() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["penilai-permintaan"], queryFn: () => api<Req[]>("/penilai/permintaan") });
  const [ayat, setAyat] = useState<Record<string, string>>({});
  const [note, setNote] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const refresh = () => qc.invalidateQueries({ queryKey: ["penilai-permintaan"] });
  const mark = useMutation({
    mutationFn: (r: Req) => api(`/penilai/anak/${r.member_id}/tanda`, { method: "POST", body: JSON.stringify({ surah_id: r.surah_id, ayah_number: Number(ayat[r.id]) }) }),
    onSuccess: refresh, onError: () => setError("Tanda belum tersimpan. Periksa nomor ayat."),
  });
  const clear = useMutation({ mutationFn: (id: string) => api(`/penilai/tanda/${id}/nonaktif`, { method: "POST" }), onSuccess: refresh, onError: () => setError("Tanda belum terhapus.") });
  const done = useMutation({
    mutationFn: (r: Req) => api(`/penilai/permintaan/${r.id}/selesai`, { method: "POST", body: JSON.stringify({ note: note[r.id] || null }) }),
    onSuccess: refresh, onError: () => setError("Belum tersimpan. Coba lagi."),
  });
  if (!data?.length) return null;
  return (
    <section className="space-y-3" aria-label="Permintaan cek dari Sesi 3">
      <h2 className="text-lg font-extrabold text-outline">Perlu dicek</h2>
      {data.map((r) => (
        <div key={r.id} className="space-y-2 rounded-[24px] bg-lav p-4">
          <p className="font-extrabold text-outline">{r.member_name}: {r.surah_name}, ayat {r.ayah_start}–{r.ayah_end}</p>
          <p className="text-sm font-semibold text-muted">{REASON[r.reason] ?? r.reason}{r.ayah_number ? ` (ayat ${r.ayah_number})` : ""}</p>
          {r.marks.length > 0 && (
            <ul className="flex flex-wrap gap-2">
              {r.marks.map((m) => (
                <li key={m.id} className="flex items-center gap-1 rounded-pill bg-cream px-3 py-1 text-sm font-extrabold text-gold-ink">
                  ★ ayat {m.ayah_number}{m.word_text ? ` · ${m.word_text}` : ""}
                  <button type="button" aria-label={`Tandai ayat ${m.ayah_number} sudah teratasi`} onClick={() => clear.mutate(m.id)} className="px-1">✓</button>
                </li>
              ))}
            </ul>
          )}
          <div className="flex gap-2">
            <input inputMode="numeric" aria-label="Nomor ayat yang perlu diperkuat" placeholder="Ayat" value={ayat[r.id] ?? ""} onChange={(e) => setAyat((s) => ({ ...s, [r.id]: e.target.value }))} className="min-h-[44px] w-20 rounded-2xl bg-white px-3 text-center" />
            <button type="button" disabled={!ayat[r.id]} onClick={() => mark.mutate(r)} className="min-h-[44px] flex-1 rounded-pill bg-cream px-3 text-sm font-extrabold text-gold-ink disabled:opacity-50">Tandai ayat sulit</button>
          </div>
          <input aria-label="Catatan" placeholder="Catatan (opsional)" value={note[r.id] ?? ""} onChange={(e) => setNote((s) => ({ ...s, [r.id]: e.target.value }))} className="min-h-[44px] w-full rounded-2xl bg-white px-3" />
          <button type="button" onClick={() => done.mutate(r)} className="min-h-[48px] w-full rounded-pill bg-brand text-[15px] font-extrabold text-white">Selesai dicek</button>
        </div>
      ))}
      {error && <p role="alert" className="text-sm font-bold text-coral">{error}</p>}
    </section>
  );
}
