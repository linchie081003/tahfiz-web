import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { GameCard } from "../components/game/GameCard";
import { GameHeader } from "../components/game/GameHeader";
import { AppPage } from "../components/layout/AppPage";
import { api } from "../lib/api";

type Child = { id: string; name: string };
type Report = {
  member_name: string;
  week_start: string;
  week_end: string;
  ayat_total: number;
  active_days: number;
  surahs_finished: number;
  daily: { date: string; label: string; ayat: number }[];
  overdue_murojaah_count: number;
  overdue_murojaah_surahs: string[];
  note: string;
};

const fmt = (d: string) => new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short" });

function Stat({ n, label, bg }: { n: number; label: string; bg: string }) {
  return (
    <div className={`flex-1 rounded-card border-2 border-line px-1 py-2 text-center shadow-game-sm ${bg}`}>
      <div className="text-2xl font-extrabold text-outline">{n}</div>
      <div className="text-[11px] font-bold text-outline">{label}</div>
    </div>
  );
}

export function WeeklyReportPage() {
  const kids = useQuery({
    queryKey: ["parent-dashboard-children"],
    queryFn: async () => (await api<{ children: Child[] }>("/parent/dashboard")).children,
  });
  const [picked, setPicked] = useState<string | null>(null);
  const memberId = picked ?? kids.data?.[0]?.id ?? null;
  const report = useQuery({
    queryKey: ["weekly-report", memberId],
    queryFn: () => api<Report>(`/parent/weekly-report?member_id=${memberId}`),
    enabled: !!memberId,
  });
  const r = report.data;
  const max = Math.max(1, ...(r?.daily.map((d) => d.ayat) ?? [1]));

  return (
    <AppPage className="pb-8">
      <GameHeader title="Laporan minggu ini" to="/parent" />

      {kids.data && kids.data.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {kids.data.map((k) => (
            <button
              key={k.id}
              type="button"
              onClick={() => setPicked(k.id)}
              className={`rounded-pill border-2 border-line px-3 py-1 text-sm font-extrabold text-outline ${
                k.id === memberId ? "bg-gradient-to-b from-game-gold-start to-game-gold-end" : "bg-white"
              }`}
            >
              {k.name}
            </button>
          ))}
        </div>
      )}
      {kids.data && kids.data.length === 0 && <GameCard>Belum ada profil anak.</GameCard>}
      {report.isLoading && memberId && <GameCard>Memuat laporan…</GameCard>}
      {report.isError && <GameCard>Laporan belum bisa dimuat. Coba lagi sebentar.</GameCard>}

      {r && (
        <>
          <p className="text-center text-sm font-bold text-outline">
            {fmt(r.week_start)} – {fmt(r.week_end)} · {r.member_name}
          </p>
          <div className="flex gap-2">
            <Stat n={r.ayat_total} label="ayat baru" bg="bg-[#CFF5C6]" />
            <Stat n={r.active_days} label="hari aktif" bg="bg-cream" />
            <Stat n={r.surahs_finished} label="surat lulus" bg="bg-[#D8F4FF]" />
          </div>
          <GameCard>
            <p className="mb-2 text-sm font-extrabold text-outline">Ayat dihafal per hari</p>
            <div className="flex h-32 items-end gap-1.5" role="img" aria-label="Grafik ayat per hari">
              {r.daily.map((d) => (
                <div key={d.date} className="flex h-full flex-1 flex-col items-center justify-end">
                  <div
                    className={`w-full max-w-[28px] rounded-t-lg border-2 border-line ${
                      d.ayat ? "bg-gradient-to-b from-game-green-start to-game-green-end" : "bg-[#E4E7F0]"
                    }`}
                    style={{ height: d.ayat ? `${Math.max(12, (d.ayat / max) * 100)}%` : 6 }}
                  />
                  <span className="mt-1 text-[11px] font-bold text-outline">{d.label}</span>
                </div>
              ))}
            </div>
          </GameCard>
          <GameCard className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-game border-2 border-line bg-coral/15 text-2xl font-extrabold text-outline">
              {r.overdue_murojaah_count}
            </div>
            <div>
              <p className="font-extrabold text-outline">Murojaah tertunda</p>
              <p className="text-sm font-semibold text-outline/70">
                {r.overdue_murojaah_count ? r.overdue_murojaah_surahs.join(", ") : "Semua murojaah terkejar."}
              </p>
            </div>
          </GameCard>
          <GameCard className="bg-brand-light text-sm font-semibold text-outline">
            <b>Catatan:</b> {r.note}
          </GameCard>
        </>
      )}
    </AppPage>
  );
}
