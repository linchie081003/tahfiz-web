import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { Page } from "../components/ui/ui";

type Child = { id: string; name: string; color?: string; pending_setor?: number };
type Dash = { children: Child[]; queue_total: number };
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
const BAR = ["#0F766E", "#4F46B5", "#F26B3A", "#1E96D4", "#F2B01E", "#6C63C9", "#0F766E"];

function Stat({ n, label, bg }: { n: number; label: string; bg: string }) {
  return (
    <div className={`flex flex-1 flex-col items-center rounded-[22px] px-1 py-3 ${bg}`}>
      <span className="text-[28px] font-extrabold leading-none text-outline">{n}</span>
      <span className="mt-1 text-xs font-extrabold text-outline">{label}</span>
    </div>
  );
}

/** Orang tua: Perkembangan anak minggu ini. */
export function WeeklyReportPage() {
  const dash = useQuery({ queryKey: ["parent-dashboard"], queryFn: () => api<Dash>("/parent/dashboard") });
  const kids = dash.data?.children ?? [];
  const [picked, setPicked] = useState<string | null>(null);
  const memberId = picked ?? kids[0]?.id ?? null;
  const report = useQuery({ queryKey: ["weekly-report", memberId], queryFn: () => api<Report>(`/parent/weekly-report?member_id=${memberId}`), enabled: !!memberId });
  const r = report.data;
  const max = Math.max(1, ...(r?.daily.map((d) => d.ayat) ?? [1]));
  const pending = kids.find((k) => k.id === memberId)?.pending_setor ?? 0;

  return (
    <Page>
      <header>
        <p className="text-sm font-semibold text-muted">Area orang tua</p>
        <h1 className="text-[26px] font-extrabold leading-tight text-outline">{r ? `Perkembangan ${r.member_name}` : "Laporan minggu ini"}</h1>
        {r && <p className="text-sm font-semibold text-muted">{fmt(r.week_start)} – {fmt(r.week_end)}</p>}
      </header>

      {kids.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {kids.map((k) => (
            <button key={k.id} type="button" onClick={() => setPicked(k.id)} aria-pressed={k.id === memberId}
              className={`flex min-h-[44px] items-center gap-2 rounded-pill px-3 pr-4 font-extrabold ${k.id === memberId ? "bg-teal text-white" : "bg-lav text-brand-dark"}`}>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-teal">{k.name.charAt(0).toUpperCase()}</span>{k.name}
            </button>
          ))}
        </div>
      )}
      {dash.isSuccess && kids.length === 0 && <p className="rounded-[24px] bg-lav p-4 font-bold text-outline">Belum ada profil anak. Tambahkan anak dari beranda.</p>}
      {report.isLoading && memberId && <p className="font-bold text-muted">Memuat laporan…</p>}
      {report.isError && <p className="rounded-[24px] bg-cream p-4 font-bold">Laporan belum bisa dimuat. Coba lagi sebentar.</p>}

      {r && (
        <>
          <section className="rounded-[28px] bg-brand-light p-4">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-brand text-white" aria-hidden="true">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><circle cx="12" cy="12" r="8" /><path d="M12 8v4l3 2" /></svg>
              </span>
              <p className="flex-1 font-extrabold text-outline">Ayat dihafal minggu ini</p>
              <p className="text-xl font-extrabold text-brand-dark">{r.ayat_total} ayat</p>
            </div>
            <div className="mt-4 flex h-36 items-end gap-2" role="img" aria-label="Grafik ayat per hari">
              {r.daily.map((d, i) => (
                <div key={d.date} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
                  <span className="text-xs font-extrabold text-outline">{d.ayat}</span>
                  <div className="w-full max-w-[30px] rounded-pill" style={{ height: d.ayat ? `${Math.max(14, (d.ayat / max) * 100)}%` : 4, background: d.ayat ? BAR[i % BAR.length] : "#D9D7EE" }} />
                  <span className="text-xs font-bold text-muted">{d.label}</span>
                </div>
              ))}
            </div>
          </section>

          <div className="flex gap-2">
            <Stat n={r.ayat_total} label="ayat baru" bg="bg-[#CFF5C6]" />
            <Stat n={r.active_days} label="hari aktif" bg="bg-cream" />
            <Stat n={r.surahs_finished} label="surat lulus" bg="bg-[#D8F4FF]" />
          </div>

          <section className="flex items-center gap-3 rounded-[28px] bg-brand-light p-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-coral/20 text-2xl font-extrabold text-outline">{r.overdue_murojaah_count}</span>
            <div className="min-w-0">
              <p className="font-extrabold text-outline">Murajaah tertunda</p>
              <p className="text-sm font-semibold text-muted">{r.overdue_murojaah_count ? r.overdue_murojaah_surahs.join(", ") : "Semua murajaah terkejar."}</p>
            </div>
          </section>

          {pending > 0 && (
            <Link to="/parent/queue" className="flex items-center gap-3 rounded-[28px] border-2 border-gold bg-cream p-4">
              <span className="flex-1 font-extrabold text-outline">Setoran menunggu penilaian</span>
              <span className="text-sm font-extrabold text-brand-dark">{pending} rekaman ›</span>
            </Link>
          )}

          <section className="rounded-[24px] bg-cream p-4 text-sm font-semibold text-outline"><b>Catatan:</b> {r.note}</section>
        </>
      )}
    </Page>
  );
}
