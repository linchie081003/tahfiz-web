import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { surahName } from "../lib/surahInfo";
import { friendlyError, useGameToast } from "./game/GameToast";

type Judged = { id: string; member_name: string; context: string; surah_id: number | null; ayah_start: number | null; ayah_end: number | null; status: string; evaluated_at: string | null; can_correct: boolean };
type Ev = { id: string; result: string; evaluator_role: string; notes: string | null; created_at: string; corrects_id: string | null; correction_reason: string | null; active: boolean };
const LABEL: Record<string, string> = { passed: "Lulus", needs_retry: "Perlu diulang", not_fluent: "Belum lancar" };
const ROLE: Record<string, string> = { parent: "Orang tua", teacher: "Guru" };

function Detail({ s }: { s: Judged }) {
  const qc = useQueryClient();
  const toast = useGameToast();
  const [status, setStatus] = useState("passed");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const hist = useQuery({ queryKey: ["riwayat-penilaian", s.id], queryFn: () => api<Ev[]>(`/setor/${s.id}/riwayat-penilaian`) });
  const save = async () => {
    setBusy(true);
    try {
      await api(`/setor/${s.id}/koreksi`, { method: "POST", body: JSON.stringify({ status, reason: reason.trim() }) });
      toast("Koreksi tersimpan. Penilaian lama tetap ada di riwayat.", "success");
      setReason("");
      await Promise.all([qc.invalidateQueries({ queryKey: ["riwayat-penilaian", s.id] }), qc.invalidateQueries({ queryKey: ["setor-dinilai"] })]);
    } catch (e) { toast(friendlyError(e), "error"); } finally { setBusy(false); }
  };
  return (
    <div className="mt-3 space-y-3">
      <ol className="space-y-2">
        {hist.data?.map((e) => (
          <li key={e.id} className={`rounded-[16px] px-3 py-2 text-sm ${e.active ? "bg-brand-light font-bold" : "bg-white text-muted"}`}>
            <span className="font-extrabold text-outline">{LABEL[e.result] ?? e.result}</span> · {ROLE[e.evaluator_role] ?? e.evaluator_role} · {new Date(e.created_at).toLocaleDateString("id-ID")}
            {e.active && <span className="ml-2 rounded-pill bg-brand px-2 py-0.5 text-xs text-white">berlaku</span>}
            {e.correction_reason && <span className="block">Alasan koreksi: {e.correction_reason}</span>}
            {e.notes && <span className="block">{e.notes}</span>}
          </li>
        ))}
      </ol>
      {s.can_correct ? (
        <div className="space-y-2 rounded-[20px] bg-white p-3">
          <label htmlFor={`st-${s.id}`} className="block text-sm font-extrabold text-outline">Koreksi penilaian</label>
          <select id={`st-${s.id}`} className="min-h-[48px] w-full rounded-pill border-[3px] border-line bg-white px-4 font-bold" value={status} onChange={(e) => setStatus(e.target.value)}>
            {Object.entries(LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <label htmlFor={`rs-${s.id}`} className="block text-sm font-extrabold text-outline">Alasan (wajib)</label>
          <textarea id={`rs-${s.id}`} className="min-h-[72px] w-full rounded-[16px] border-[3px] border-line p-3 font-semibold" value={reason} onChange={(e) => setReason(e.target.value)} maxLength={500} />
          <button type="button" disabled={busy || !reason.trim()} onClick={() => void save()} className="min-h-[52px] w-full rounded-pill bg-brand font-extrabold text-white disabled:opacity-50">Simpan koreksi</button>
        </div>
      ) : <p className="text-sm font-semibold text-muted">Penilaian ini tidak bisa dikoreksi orang tua (dinilai guru yang terhubung, atau kewenangan dimatikan).</p>}
    </div>
  );
}

/** Riwayat penilaian: koreksi bersifat menambah, penilaian lama tidak dihapus. */
export function RiwayatPenilaian() {
  const [open, setOpen] = useState<string | null>(null);
  const q = useQuery({ queryKey: ["setor-dinilai"], queryFn: () => api<Judged[]>("/setor/dinilai") });
  if (!q.data?.length) return null;
  return (
    <section className="space-y-2 rounded-[28px] bg-brand-light p-5" aria-label="Riwayat penilaian">
      <h2 className="text-lg font-extrabold text-brand-dark">Riwayat penilaian</h2>
      {q.data.map((s) => (
        <div key={s.id} className="rounded-[20px] bg-white p-3">
          <button type="button" className="flex min-h-[48px] w-full items-center gap-2 text-left" aria-expanded={open === s.id} onClick={() => setOpen(open === s.id ? null : s.id)}>
            <span className="min-w-0 flex-1 font-extrabold text-outline">{s.member_name} · {s.surah_id ? surahName(s.surah_id) : "Setoran"}{s.ayah_start ? ` ${s.ayah_start}–${s.ayah_end}` : ""}
              <span className="block text-sm font-semibold text-muted">{LABEL[s.status] ?? s.status}</span></span>
            <span aria-hidden="true">{open === s.id ? "▾" : "▸"}</span>
          </button>
          {open === s.id && <Detail s={s} />}
        </div>
      ))}
    </section>
  );
}
