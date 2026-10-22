import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { friendlyError, useGameToast } from "./game/GameToast";

type Pulau = {
  point: number;
  name: string;
  mandatory: boolean;
  passed: boolean;
  best_score: number;
  approved_below_threshold: boolean;
  decided_by: string | null;
};
type Overview = { points: Pulau[]; gate_open: boolean; all_passed: boolean; threshold: number };

/** Sembilan Pulau tahsin. Pulau 1-3 wajib sebelum hafalan baru; 4-9 bebas urutan. */
export function TahsinPulau({ memberId, isParent }: { memberId?: string | null; isParent: boolean }) {
  const qc = useQueryClient();
  const toast = useGameToast();
  const qs = memberId ? `?member_id=${memberId}` : "";
  const { data } = useQuery({
    queryKey: ["tahsin-points", memberId ?? "self"],
    queryFn: () => api<Overview>(`/tahsin/points${qs}`),
  });
  const [open, setOpen] = useState<number | null>(null);
  const [score, setScore] = useState(8);
  const [below, setBelow] = useState(false);
  const [busy, setBusy] = useState(false);
  if (!data) return null;

  const canDecide = isParent && !!memberId;
  const save = async (point: number) => {
    setBusy(true);
    try {
      await api(`/tahsin/points/${point}/result?member_id=${memberId}`, {
        method: "POST",
        body: JSON.stringify({ score, approve_below_threshold: below }),
      });
      setOpen(null);
      setBelow(false);
      await qc.invalidateQueries({ queryKey: ["tahsin-points"] });
      await qc.invalidateQueries({ queryKey: ["home"] });
      await qc.invalidateQueries({ queryKey: ["tahsin"] });
    } catch (e) {
      toast(friendlyError(e), "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-3 rounded-[24px] bg-brand-light p-4">
      <h2 className="text-lg font-extrabold text-outline">Sembilan Pulau Tahsin</h2>
      <p className="text-sm font-semibold text-muted">
        {data.gate_open ? "Pulau 1–3 sudah lulus. Hafalan baru terbuka." : "Lulus Pulau 1–3 dulu untuk membuka hafalan baru. Pulau 4–9 boleh urutan apa saja."}{" "}
        Lulus bila nilai {data.threshold} dari 10. Pra-cek AI hanya membantu; keputusan ada pada orang tua atau guru.
      </p>
      <ul className="space-y-2">
        {data.points.map((p) => (
          <li key={p.point} className="rounded-[20px] bg-white p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="font-extrabold text-outline">Pulau {p.point}: {p.name}</p>
                <p className="text-xs font-semibold text-muted">
                  {p.mandatory ? "Wajib" : "Pilihan"}
                  {p.best_score > 0 ? ` · nilai terbaik ${p.best_score}/10` : ""}
                  {p.approved_below_threshold ? " · diluluskan di bawah batas" : ""}
                </p>
              </div>
              <span className={`shrink-0 rounded-pill px-2.5 py-0.5 text-xs font-extrabold ${p.passed ? "bg-teal text-white" : "bg-lav text-brand-dark"}`}>{p.passed ? "Lulus" : "Belum"}</span>
            </div>
            {p.passed && !canDecide && (
              <Link to={`/sertifikat/${p.point}`} className="mt-1 inline-block text-sm font-extrabold text-brand">Lihat sertifikat</Link>
            )}
            {canDecide && !p.passed && (
              <button type="button" className="mt-2 min-h-[44px] text-sm font-extrabold text-brand underline" onClick={() => setOpen(open === p.point ? null : p.point)}>Catat hasil</button>
            )}
            {open === p.point && (
              <div className="mt-2 space-y-2">
                <label className="block text-sm font-extrabold" htmlFor={`skor-${p.point}`}>Nilai (0–10)</label>
                <input id={`skor-${p.point}`} type="number" min={0} max={10} step={0.5} className="min-h-[48px] w-full rounded-pill border-[3px] border-line px-4 font-bold outline-none focus:border-brand" value={score} onChange={(e) => setScore(Math.min(10, Math.max(0, Number(e.target.value))))} />
                {score < data.threshold && (
                  <label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" checked={below} onChange={(e) => setBelow(e.target.checked)} />Luluskan meski di bawah {data.threshold}</label>
                )}
                <button type="button" className="min-h-[52px] w-full rounded-pill bg-brand text-lg font-extrabold text-white disabled:opacity-50" disabled={busy} onClick={() => void save(p.point)}>Simpan hasil</button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
