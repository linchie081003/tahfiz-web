import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { friendlyError, useGameToast } from "./game/GameToast";

type Row = { id: string; day: string; kind: string; status: string; reason: string | null };
type Kpi = { rate: number | null; completed: number; applicable_closed: number };
type Out = { sessions: Row[]; kpi: Kpi };

const NAMA: Record<string, string> = { sesi1: "Sesi 1 · Murajaah", sesi2: "Sesi 2 · Hafalan baru", sesi3: "Sesi 3 · Penguatan" };
const STATUS: Record<string, { t: string; c: string }> = {
  available: { t: "Berlaku", c: "bg-gold text-gold-ink" },
  completed: { t: "Selesai", c: "bg-teal text-white" },
  missed: { t: "Terlewat", c: "bg-coral text-gold-ink" },
  not_applicable: { t: "Tidak berlaku", c: "bg-lav text-muted" },
  disabled_manually: { t: "Dimatikan", c: "bg-lav text-muted" },
};

/** Sesi harian anak: berlaku/tidak, hasil, dan KPI konsistensi 30 hari. Hanya orang tua yang bisa mematikan sesi. */
export function SesiHarianCard({ memberId }: { memberId: string }) {
  const qc = useQueryClient();
  const toast = useGameToast();
  const key = ["sesi-harian", memberId];
  const { data } = useQuery({ queryKey: key, queryFn: () => api<Out>(`/sesi-harian/anak/${memberId}`) });
  if (!data) return null;
  const today = new Date().toLocaleDateString("sv-SE");
  const rows = data.sessions.filter((r) => r.day === today);

  const toggle = async (r: Row) => {
    try {
      if (r.status === "disabled_manually") {
        await api(`/sesi-harian/anak/${memberId}/${r.kind}/aktif`, { method: "POST", body: JSON.stringify({}) });
      } else {
        const reason = window.prompt(`Alasan mematikan ${NAMA[r.kind]} hari ini?`)?.trim();
        if (!reason) return;
        await api(`/sesi-harian/anak/${memberId}/${r.kind}/nonaktif`, { method: "POST", body: JSON.stringify({ reason }) });
      }
      await qc.invalidateQueries({ queryKey: key });
    } catch (e) {
      toast(friendlyError(e), "error");
    }
  };

  return (
    <section className="space-y-2 rounded-[28px] bg-lav p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-extrabold text-outline">Sesi harian</h2>
        <span className="text-xs font-bold text-muted">
          Konsistensi 30 hari: {data.kpi.rate == null ? "—" : `${Math.round(data.kpi.rate * 100)}%`} ({data.kpi.completed}/{data.kpi.applicable_closed})
        </span>
      </div>
      {rows.map((r) => {
        const st = STATUS[r.status] ?? STATUS.available;
        const canToggle = r.status !== "completed" && r.status !== "missed";
        return (
          <div key={r.id} className="flex items-center gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-extrabold text-outline">{NAMA[r.kind] ?? r.kind}</p>
              {r.reason && <p className="text-xs font-semibold text-muted">{r.reason}</p>}
            </div>
            <span className={`rounded-pill px-3 py-1 text-xs font-extrabold ${st.c}`}>{st.t}</span>
            {canToggle && (
              <button type="button" onClick={() => void toggle(r)} className="rounded-pill border-2 border-line px-3 py-1 text-xs font-extrabold text-brand-dark">
                {r.status === "disabled_manually" ? "Nyalakan" : "Matikan"}
              </button>
            )}
          </div>
        );
      })}
    </section>
  );
}
