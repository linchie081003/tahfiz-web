import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
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
    <div className="card-surface space-y-3 p-4 text-gray-800">
      <h2 className="font-bold text-purple-800">Sembilan Pulau Tahsin</h2>
      <p className="text-xs text-gray-600">
        {data.gate_open
          ? "Pulau 1–3 sudah lulus. Hafalan baru terbuka."
          : "Lulus Pulau 1–3 dulu untuk membuka hafalan baru. Pulau 4–9 boleh urutan apa saja."}{" "}
        Lulus bila nilai {data.threshold} dari 10. Keputusan ada pada orang tua atau guru; pra-cek AI hanya membantu.
      </p>
      <ul className="space-y-2">
        {data.points.map((p) => (
          <li key={p.point} className="rounded-xl border p-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="font-semibold">
                  Pulau {p.point}: {p.name}
                </p>
                <p className="text-xs text-gray-600">
                  {p.mandatory ? "Wajib" : "Pilihan"}
                  {p.best_score > 0 ? ` · nilai terbaik ${p.best_score}/10` : ""}
                  {p.approved_below_threshold ? " · diluluskan di bawah batas" : ""}
                </p>
              </div>
              <span className={p.passed ? "font-bold text-emerald-700" : "text-gray-500"}>
                {p.passed ? "Lulus" : "Belum"}
              </span>
            </div>
            {canDecide && !p.passed && (
              <button type="button" className="mt-2 text-sm font-bold text-brand underline" onClick={() => setOpen(open === p.point ? null : p.point)}>
                Catat hasil
              </button>
            )}
            {open === p.point && (
              <div className="mt-2 space-y-2">
                <label className="block text-sm font-semibold" htmlFor={`skor-${p.point}`}>
                  Nilai (0–10)
                </label>
                <input
                  id={`skor-${p.point}`}
                  type="number"
                  min={0}
                  max={10}
                  step={0.5}
                  className="w-full rounded-xl border p-2"
                  value={score}
                  onChange={(e) => setScore(Math.min(10, Math.max(0, Number(e.target.value))))}
                />
                {score < data.threshold && (
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={below} onChange={(e) => setBelow(e.target.checked)} />
                    Luluskan meski di bawah {data.threshold}
                  </label>
                )}
                <button type="button" className="btn-cta w-full" disabled={busy} onClick={() => void save(p.point)}>
                  Simpan hasil
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
