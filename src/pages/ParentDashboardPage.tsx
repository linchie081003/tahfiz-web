import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, setToken } from "../lib/api";
import { formatFamilyCodeDisplay } from "../lib/familyCode";
import { Card, Page, ScreenHead } from "../components/ui/ui";
import { NavBook, NavDrop, NavFlame, NavMic, NavSprout, NavUser } from "../components/icons/NavIcons";

type ChildSummary = { id: string; name: string; color: string; age_mode: string; tahsin_status: string; xp: number; streak_days: number; level: number; passed_surahs: number; pending_setor: number; tahsin_line: string; hafalan_line: string; murajaah_due: number; murajaah_surah: string; hafalan_open?: boolean; mandatory_passed?: number };
type Dashboard = { family_name: string; family_access_code: string; queue_total: number; active_member_id: string | null; children: ChildSummary[] };
const TAHSIN: Record<string, string> = { not_started: "Belum mulai", in_progress: "Sedang berlatih", pending_eval: "Menunggu keputusan", passed: "Pulau 1–3 selesai" };

/** Ringkasan hari ini untuk orang tua (Area orang tua). */
export function ParentDashboardPage() {
  const nav = useNavigate();
  const qc = useQueryClient();
  const [sel, setSel] = useState<string | null>(null);
  const { data, isLoading, isError } = useQuery({ queryKey: ["parent-dashboard"], queryFn: () => api<Dashboard>("/parent/dashboard"), retry: false });
  const c = data?.children.find((x) => x.id === sel) ?? data?.children[0];
  const teacher = useQuery({ queryKey: ["teacher-link", c?.id], enabled: !!c, queryFn: () => api<{ link: { status: string; teacher: { name: string } } | null }>(`/family/members/${c!.id}/teacher`) });

  const openAsChild = async (id: string) => {
    const t = await api<{ access_token: string }>(`/members/${id}/impersonate`, { method: "POST" });
    setToken(t.access_token);
    await qc.invalidateQueries();
    nav("/", { replace: true });
  };
  if (isLoading) return <Page><ScreenHead back={false} eyebrow="Area orang tua" title="Ringkasan hari ini" /><p className="text-center font-bold text-muted">Memuat…</p></Page>;
  if (isError || !data) return <Page><ScreenHead back={false} title="Ringkasan" /><p className="font-bold">Halaman ini hanya untuk akun orang tua.</p></Page>;
  const link = teacher.data?.link;
  const hasTeacher = link?.status === "active";

  const attention: { key: string; icon: React.ReactNode; tone: string; body: React.ReactNode; action?: React.ReactNode }[] = [];
  if (c) {
    if (c.murajaah_due > 0) attention.push({ key: "mr", tone: "bg-coral", icon: <NavDrop size={22} />, body: <>Hafalan <b>{c.murajaah_surah || "surat"}</b> perlu diulang hari ini{c.murajaah_due > 1 ? ` (+${c.murajaah_due - 1} lainnya)` : ""}.</> });
    if (c.pending_setor > 0) attention.push({ key: "ps", tone: "bg-teal", icon: <NavMic size={22} />, body: <>{c.pending_setor} keputusan menunggu {hasTeacher ? "guru" : "Anda"}: lanjut atau ulang.</>, action: !hasTeacher ? <Link to="/parent/queue" className="rounded-pill bg-brand px-4 py-2 text-sm font-extrabold text-white">Tinjau</Link> : undefined });
    // Banner hanya bila hafalan memang masih terkunci. Mode paralel membukanya, jadi banner hilang.
    if (c.hafalan_open === false && c.tahsin_status !== "passed" && !hasTeacher) attention.push({ key: "gt", tone: "bg-teal", icon: <NavMic size={22} />, body: <>Gerbang hafalan belum terbuka. Pulau 1 sampai 3 lulus dulu ({c.mandatory_passed ?? 0} dari 3).</>, action: <Link to={`/parent/sahkan/${c.id}`} className="rounded-pill bg-teal px-4 py-2 text-sm font-extrabold text-white">Nilai</Link> });
  }
  const row = (icon: React.ReactNode, tone: string, label: string, text: string, to: string) => (
    <Link to={to} className={`flex min-h-[52px] items-center gap-3 rounded-pill px-2.5 py-1.5 ${tone}`}>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-outline">{icon}</span>
      <span className="min-w-0 flex-1 truncate text-[15px] font-semibold"><b className="font-extrabold">{label}</b> {text}</span>
    </Link>
  );

  return (
    <div className="space-y-4 px-5 pb-6 pt-4">
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[13px] font-bold text-muted">Area orang tua</p>
          <h1 className="text-[26px] font-extrabold leading-tight text-outline">Ringkasan hari ini</h1>
        </div>
        {c && <button type="button" onClick={() => void openAsChild(c.id)} className="flex shrink-0 items-center gap-2 rounded-pill bg-[#1672B5] px-4 py-3 text-[15px] font-extrabold text-white"><NavUser size={20} />Mode anak</button>}
      </header>

      <div className="flex gap-2 overflow-x-auto" role="tablist" aria-label="Pilih anak">
        {data.children.map((k) => (
          <button key={k.id} role="tab" aria-selected={k.id === c?.id} type="button" onClick={() => setSel(k.id)}
            className={`flex shrink-0 items-center gap-2 rounded-pill px-3 py-2 text-lg font-extrabold ${k.id === c?.id ? "bg-teal text-white" : "bg-[#6B63C9] text-white"}`}>
            <span className={`flex h-7 w-7 items-center justify-center rounded-full bg-white text-sm font-extrabold ${k.id === c?.id ? "text-teal" : "text-[#6B63C9]"}`}>{k.name.charAt(0).toUpperCase()}</span>{k.name}
          </button>
        ))}
        <button type="button" onClick={() => nav("/parent/tambah-anak")} className="flex shrink-0 items-center gap-1 rounded-pill bg-lav px-4 py-2 text-lg font-extrabold text-brand-dark">+ Anak</button>
      </div>

      {!c ? (
        <Card tone="lav"><p className="font-extrabold">Belum ada profil anak.</p><p className="text-sm font-semibold text-muted">Ketuk "+ Anak" untuk menambah.</p></Card>
      ) : (
        <>
          {!hasTeacher && (
            <section className="flex items-center gap-3 rounded-[24px] bg-lav p-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold text-gold-ink"><NavUser size={22} /></span>
              <div className="min-w-0 flex-1">
                <p className="font-extrabold text-outline">{link?.status === "requested" ? "Menunggu guru" : "Belum ada guru"}</p>
                <p className="text-sm font-semibold leading-snug text-muted">{link?.status === "requested" ? `Permintaan untuk ${c.name} sudah dikirim. Penilaian sementara dari AI dan Anda.` : `Penilaian saat ini dari AI saja. Hubungkan guru agar bacaan ${c.name} diperiksa.`}</p>
              </div>
              <Link to="/parent/guru" className="shrink-0 rounded-pill bg-brand px-4 py-2 text-sm font-extrabold text-white">{link?.status === "requested" ? "Lihat" : "Hubungkan"}</Link>
            </section>
          )}

          <section className="space-y-3 rounded-[32px] bg-brand p-4 text-white">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold">Belajar hari ini</h2>
              <span className="flex items-center gap-1 rounded-pill bg-gold px-3 py-1 text-sm font-extrabold text-gold-ink"><NavFlame size={16} />{c.streak_days} hari</span>
            </div>
            {row(<NavMic size={20} />, "bg-teal text-white", "Tahsin", c.tahsin_line || TAHSIN[c.tahsin_status] || "", "/parent/laporan")}
            {row(<NavSprout size={20} />, "bg-[#6B63C9] text-white", "Hafalan", c.hafalan_line || "Belum dimulai", "/parent/laporan")}
            {row(<NavBook size={20} />, "bg-coral text-gold-ink", "Tilawah", "Baca bersama anak", "/quran")}
          </section>

          {attention.length > 0 && (
            <section className="space-y-3 rounded-[28px] border-2 border-gold bg-cream p-4">
              <h2 className="text-lg font-extrabold text-gold-ink">Perlu perhatian</h2>
              {attention.map((a) => (
                <div key={a.key} className="flex items-center gap-3">
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white ${a.tone}`}>{a.icon}</span>
                  <p className="min-w-0 flex-1 text-[15px] font-semibold leading-snug text-outline">{a.body}</p>
                  {a.action}
                </div>
              ))}
            </section>
          )}
        </>
      )}

      <Link to="/parent/laporan" className="flex min-h-[56px] items-center justify-between rounded-pill bg-teal px-5 text-base font-extrabold text-white">
        <span>Lihat laporan lengkap</span><span aria-hidden>›</span>
      </Link>
      <p className="text-center text-xs font-semibold text-muted">Kode keluarga untuk anak: <span className="font-mono font-extrabold tracking-widest">{formatFamilyCodeDisplay(data.family_access_code)}</span></p>
    </div>
  );
}
