import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, setToken } from "../lib/api";
import { formatFamilyCodeDisplay } from "../lib/familyCode";
import { Avatar, Btn, Card, Chip, Page, ScreenHead } from "../components/ui/ui";

type ChildSummary = { id: string; name: string; color: string; age_mode: string; tahsin_status: string; xp: number; streak_days: number; level: number; passed_surahs: number; pending_setor: number };
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

  return (
    <Page>
      <ScreenHead back={false} eyebrow="Area orang tua" title="Ringkasan hari ini" sub={data.family_name} />
      {data.children.length === 0 ? (
        <Card tone="lav"><p className="mb-2 font-extrabold">Belum ada profil anak.</p><Btn onClick={() => nav("/pilih-profil")}>Tambah anak</Btn></Card>
      ) : (
        <>
          <div className="flex gap-2 overflow-x-auto" role="tablist" aria-label="Pilih anak">
            {data.children.map((k) => (
              <button key={k.id} role="tab" aria-selected={k.id === c?.id} type="button" onClick={() => setSel(k.id)}
                className={`flex shrink-0 items-center gap-2 rounded-pill px-3 py-1.5 font-extrabold ${k.id === c?.id ? "bg-brand text-white" : "bg-lav text-brand-dark"}`}>
                <Avatar name={k.name} color={k.color} size={28} />{k.name}
              </button>
            ))}
          </div>
          {c && (
            <>
              {!hasTeacher && (
                <Card tone="cream">
                  <p className="font-extrabold text-gold-ink">{link?.status === "requested" ? "Menunggu guru" : "Belum ada guru"}</p>
                  <p className="mb-2 text-sm font-semibold text-gold-ink">Penilaian saat ini dari AI saja dan keputusan ada pada Anda. Hubungkan guru agar bacaan {c.name} diperiksa.</p>
                  <Btn variant="outline" onClick={() => nav("/parent/guru")}>Hubungkan guru</Btn>
                </Card>
              )}
              <Card tone="lav">
                <p className="mb-2 text-lg font-extrabold">Belajar hari ini</p>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div><p className="text-2xl font-extrabold text-brand-dark">{c.streak_days}</p><p className="text-xs font-bold text-muted">hari beruntun</p></div>
                  <div><p className="text-2xl font-extrabold text-brand-dark">{c.xp}</p><p className="text-xs font-bold text-muted">bintang</p></div>
                  <div><p className="text-2xl font-extrabold text-brand-dark">{c.passed_surahs}</p><p className="text-xs font-bold text-muted">surat lulus</p></div>
                </div>
              </Card>
              <Card tone="plain" className="space-y-2">
                <div className="flex items-center justify-between"><p className="font-extrabold">Tahsin</p><Chip tone={c.tahsin_status === "passed" ? "teal" : "lav"}>{TAHSIN[c.tahsin_status] ?? c.tahsin_status}</Chip></div>
                <p className="text-sm font-semibold text-muted">Level {c.level}</p>
              </Card>
              {(c.pending_setor > 0 || c.tahsin_status !== "passed") && (
                <Card tone="cream">
                  <p className="mb-2 text-lg font-extrabold text-gold-ink">Perlu perhatian</p>
                  {c.pending_setor > 0 && (
                    <div className="mb-2 flex items-center gap-2">
                      <p className="min-w-0 flex-1 font-bold">{c.pending_setor} keputusan menunggu {hasTeacher ? "guru" : "Anda"}: lanjut atau ulang.</p>
                      {!hasTeacher && <Link to="/parent/queue" className="rounded-pill bg-brand px-4 py-2 font-extrabold text-white">Tinjau</Link>}
                    </div>
                  )}
                  {c.tahsin_status !== "passed" && !hasTeacher && (
                    <div className="flex items-center gap-2">
                      <p className="min-w-0 flex-1 font-bold">Gerbang hafalan belum terbuka.</p>
                      <Link to={`/parent/sahkan/${c.id}`} className="rounded-pill bg-teal px-4 py-2 font-extrabold text-white">Buka</Link>
                    </div>
                  )}
                </Card>
              )}
              <Btn variant="soft" onClick={() => void openAsChild(c.id)}>Buka tampilan {c.name}</Btn>
            </>
          )}
          <Link to="/parent/laporan" className="block min-h-[48px] text-center text-lg font-extrabold leading-[48px] text-brand">Lihat laporan lengkap</Link>
          <Card tone="plain">
            <p className="text-sm font-bold text-muted">Kode login anak</p>
            <p className="font-mono text-2xl font-extrabold tracking-[0.3em]">{formatFamilyCodeDisplay(data.family_access_code)}</p>
          </Card>
        </>
      )}
    </Page>
  );
}
