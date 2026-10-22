import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../lib/api";
import { Btn, Card, Chip, Notice, Page, ScreenHead } from "../../components/ui/ui";
import { friendlyError, useGameToast } from "../../components/game/GameToast";

type Ov = { points: { point: number; name: string; mandatory: boolean; passed: boolean; best_score: number }[]; gate_open: boolean; threshold: number };

/** Orang tua mendengar bacaan anak lalu mengesahkan Pulau 1–3 untuk membuka hafalan baru. */
export function OrtuSahkanPage() {
  const { memberId } = useParams();
  const nav = useNavigate();
  const qc = useQueryClient();
  const toast = useGameToast();
  const [heard, setHeard] = useState(false);
  const [scores, setScores] = useState<Record<number, number>>({});
  const [busy, setBusy] = useState(false);
  const { data } = useQuery({ queryKey: ["tahsin-points", memberId], queryFn: () => api<Ov>(`/tahsin/points?member_id=${memberId}`) });
  const name = useQuery({ queryKey: ["members"], queryFn: () => api<{ id: string; name: string }[]>("/members") }).data?.find((m) => m.id === memberId)?.name ?? "anak";
  if (!data) return <p className="p-8 text-center font-extrabold text-muted">Memuat…</p>;
  const gate = data.points.filter((p) => p.mandatory);
  const val = (p: { point: number; best_score: number }) => scores[p.point] ?? (p.best_score > 0 ? p.best_score : data.threshold);
  // Pulau 1, 2, 3 diluluskan satu per satu secara berurutan; gerbang terbuka sendiri setelah ketiganya lulus.
  const nextP = gate.find((p) => !p.passed);
  const pass = async (p: { point: number; name: string; best_score: number }) => {
    setBusy(true);
    try {
      const sc = val(p);
      await api(`/tahsin/points/${p.point}/result?member_id=${memberId}`, { method: "POST", body: JSON.stringify({ score: sc, approve_below_threshold: sc < data.threshold }) });
      await qc.invalidateQueries();
      setHeard(false);
      toast(p.point === 3 ? "Gerbang hafalan terbuka" : `${p.name} lulus`, "success");
      if (p.point === 3) nav("/parent", { replace: true });
    } catch (e) { toast(friendlyError(e), "error"); } finally { setBusy(false); }
  };
  return (
    <Page>
      <ScreenHead eyebrow="Area orang tua" title="Nilai Pulau 1 sampai 3" sub={`Untuk ${name}`} />
      {data.gate_open
        ? <Notice tone="lav">Gerbang sudah terbuka. {name} bisa mulai hafalan baru.</Notice>
        : <Notice tone="lav">Hafalan baru terbuka setelah Pulau 1, 2, dan 3 lulus, berurutan. Bisa juga dibuka lebih awal lewat pengaturan {name} (Hafalan jalan bersama tahsin).</Notice>}
      <Card tone="lav">
        <p className="mb-2 text-lg font-extrabold">Nilai Pulau 1–3 untuk {name}</p>
        <div className="space-y-2">
          {gate.map((p) => (
            <div key={p.point} className="flex items-center gap-3 rounded-[20px] bg-white p-3">
              <div className="min-w-0 flex-1"><p className="font-extrabold">Pulau {p.point}: {p.name}</p>{p.passed && <Chip tone="teal">Sudah lulus</Chip>}{!p.passed && p.point !== nextP?.point && <p className="text-sm font-semibold text-muted">Terkunci sampai Pulau {p.point - 1} lulus</p>}</div>
              {!p.passed && p.point === nextP?.point && (
                <label className="flex items-center gap-1 font-extrabold">
                  <input type="number" min={0} max={10} step={0.5} aria-label={`Nilai ${p.name}`} value={val(p)} onChange={(e) => setScores({ ...scores, [p.point]: Math.min(10, Math.max(0, Number(e.target.value))) })}
                    className="min-h-[48px] w-20 rounded-pill border-[3px] border-line text-center outline-none focus:border-brand" />/10
                </label>
              )}
            </div>
          ))}
        </div>
        <p className="mt-2 text-sm font-semibold text-muted">Syarat lulus: {data.threshold} dari 10 di tiap poin. Di bawah itu tetap boleh Anda luluskan.</p>
      </Card>
      <Notice>Pra-cek AI bukan penilaian guru. Dengarkan dulu rekaman latihan terbaru, lalu putuskan.</Notice>
      <label className="flex items-start gap-3 rounded-[20px] bg-white p-3 font-bold">
        <input type="checkbox" className="mt-1 h-6 w-6 accent-[#0F766E]" checked={heard} onChange={(e) => setHeard(e.target.checked)} />
        Saya sudah mendengar bacaan {name} dan menilai cukup baik untuk mulai menghafal.
      </label>
      {nextP && <Btn variant="teal" disabled={!heard || busy} onClick={() => void pass(nextP)}>Luluskan Pulau {nextP.point}</Btn>}
    </Page>
  );
}
