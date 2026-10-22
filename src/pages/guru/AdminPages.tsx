import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { NavLink, Navigate, Outlet } from "react-router-dom";
import { api } from "../../lib/api";
import { useLogout } from "../../lib/auth";
import { NavHome, NavSprout, NavSliders } from "../../components/icons/NavIcons";
import { Avatar, Btn, Card, Chip, Notice, Page, ScreenHead } from "../../components/ui/ui";
import { friendlyError, useGameToast } from "../../components/game/GameToast";
import { useTeacher } from "./GuruShell";

const cls = (a: boolean) => `flex min-h-[56px] flex-1 flex-col items-center justify-center gap-0.5 rounded-[22px] px-1 text-[12px] font-extrabold ${a ? "bg-lav text-brand-dark" : "text-muted"}`;

export function AdminShell() {
  const me = useTeacher();
  if (me.isError) return <Navigate to="/guru/masuk" replace />;
  if (!me.data) return <div className="app-shell"><p className="p-8 text-center font-extrabold text-muted">Memuat…</p></div>;
  if (!me.data.is_admin) return <Navigate to="/guru" replace />;
  return (
    <div className="app-shell">
      <div className="game-scene pb-24 pt-3"><Outlet /></div>
      <nav className="fixed bottom-0 left-1/2 z-40 w-full max-w-game -translate-x-1/2 bg-brand-light" aria-label="Menu admin instansi">
        <div className="flex gap-1 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2">
          <NavLink to="/admin" end className={({ isActive }) => cls(isActive)}><NavHome size={22} />Beranda</NavLink>
          <NavLink to="/admin/guru" className={({ isActive }) => cls(isActive)}><NavSprout size={22} />Guru</NavLink>
          <NavLink to="/admin/keluarga" className={({ isActive }) => cls(isActive)}><NavSliders size={22} />Keluarga</NavLink>
        </div>
      </nav>
    </div>
  );
}

type Summary = { name: string; invite_code: string; teachers: number; students: number; families: number; pending_teachers: number; pending_transfers: number };
type T = { id: string; name: string; status: string; is_admin: boolean; created_at: string; students: number };
type Tr = { id: string; family: string; children: number; has_teacher: boolean; created_at: string };

export function AdminBerandaPage() {
  const logout = useLogout();
  const toast = useGameToast();
  const s = useQuery({ queryKey: ["adm-sum"], queryFn: () => api<Summary>("/institution/summary") }).data;
  if (!s) return <Page><ScreenHead back={false} title="Memuat…" /></Page>;
  const share = () => { const t = `Kode instansi ${s.name}: ${s.invite_code}`; if (navigator.share) void navigator.share({ text: t }).catch(() => {}); else void navigator.clipboard?.writeText(t).then(() => toast("Tersalin", "success")); };
  return (
    <Page>
      <ScreenHead back={false} eyebrow="Admin instansi" title={s.name} />
      <div className="grid grid-cols-3 gap-2">
        {[[s.teachers, "Guru"], [s.students, "Murid"], [s.families, "Keluarga"]].map(([n, l]) => <Card key={l as string} tone="lav" className="text-center"><p className="text-2xl font-extrabold text-brand-dark">{n}</p><p className="text-xs font-bold text-muted">{l}</p></Card>)}
      </div>
      {(s.pending_teachers > 0 || s.pending_transfers > 0) && (
        <Card tone="cream" className="space-y-2">
          <p className="text-lg font-extrabold text-gold-ink">Perlu tindakan</p>
          {s.pending_teachers > 0 && <p className="font-bold">{s.pending_teachers} guru menunggu verifikasi. Rekaman murid belum bisa didengar sebelum diverifikasi.</p>}
          {s.pending_transfers > 0 && <p className="font-bold">{s.pending_transfers} keluarga meminta pindah. Setujui atau tolak, lalu tetapkan guru.</p>}
        </Card>
      )}
      <Card tone="plain">
        <p className="text-sm font-bold text-muted">Kode instansi untuk guru dan keluarga</p>
        <p className="mb-2 text-3xl font-extrabold tracking-widest text-brand-dark">{s.invite_code}</p>
        <Btn variant="soft" onClick={share}>Bagikan</Btn>
      </Card>
      <Notice tone="lav">Admin hanya melihat ringkasan dan status. Rekaman suara anak hanya didengar guru yang ditugaskan.</Notice>
      <Btn variant="outline" onClick={logout}>Keluar</Btn>
    </Page>
  );
}

export function AdminGuruPage() {
  const qc = useQueryClient();
  const toast = useGameToast();
  const { data } = useQuery({ queryKey: ["adm-teachers"], queryFn: () => api<T[]>("/institution/teachers") });
  const act = useMutation({
    mutationFn: (v: { id: string; approve: boolean }) => api(`/institution/teachers/${v.id}/verify`, { method: "POST", body: JSON.stringify({ approve: v.approve }) }),
    onSuccess: () => qc.invalidateQueries(), onError: (e) => toast(friendlyError(e), "error"),
  });
  const list = (data ?? []).filter((x) => !x.is_admin);
  const group = (st: string, title: string) => {
    const g = list.filter((x) => x.status === st);
    if (!g.length) return null;
    return (
      <section className="space-y-2">
        <h2 className="text-lg font-extrabold">{title} ({g.length})</h2>
        {g.map((x) => (
          <Card key={x.id} tone="plain" className="flex items-center gap-3">
            <Avatar name={x.name} />
            <div className="min-w-0 flex-1"><p className="font-extrabold">{x.name}</p><p className="text-sm font-semibold text-muted">{x.students} murid</p></div>
            {x.status === "pending" ? (<><button type="button" className="min-h-[44px] rounded-pill bg-teal px-3 font-extrabold text-white" onClick={() => act.mutate({ id: x.id, approve: true })}>Verifikasi</button><button type="button" className="min-h-[44px] px-2 font-extrabold text-[#B3261E]" onClick={() => act.mutate({ id: x.id, approve: false })}>Tolak</button></>)
              : x.status === "verified" ? <button type="button" className="min-h-[44px] px-2 font-extrabold text-[#B3261E]" onClick={() => window.confirm(`Cabut verifikasi ${x.name}?`) && act.mutate({ id: x.id, approve: false })}>Cabut</button>
              : <button type="button" className="min-h-[44px] px-2 font-extrabold text-teal" onClick={() => act.mutate({ id: x.id, approve: true })}>Verifikasi</button>}
          </Card>
        ))}
      </section>
    );
  };
  return (
    <Page>
      <ScreenHead back={false} eyebrow="Admin instansi" title="Guru" />
      {list.length === 0 && <Card tone="lav"><p className="font-extrabold">Belum ada guru</p><p className="text-sm font-semibold text-muted">Bagikan kode instansi agar guru mendaftar.</p></Card>}
      {group("pending", "Menunggu verifikasi")}{group("verified", "Terverifikasi")}{group("rejected", "Ditolak")}
    </Page>
  );
}

export function AdminKeluargaPage() {
  const qc = useQueryClient();
  const toast = useGameToast();
  const [pick, setPick] = useState<Record<string, string>>({});
  const tr = useQuery({ queryKey: ["adm-tr"], queryFn: () => api<Tr[]>("/institution/transfers") }).data ?? [];
  const teachers = (useQuery({ queryKey: ["adm-teachers"], queryFn: () => api<T[]>("/institution/teachers") }).data ?? []).filter((t) => t.status === "verified" && !t.is_admin);
  const fam = useQuery({ queryKey: ["adm-fam"], queryFn: () => api<{ id: string; name: string; children: number }[]>("/institution/families") }).data ?? [];
  const decide = useMutation({
    mutationFn: (v: { id: string; approve: boolean }) => api(`/institution/transfers/${v.id}/decide`, { method: "POST", body: JSON.stringify({ approve: v.approve, teacher_id: v.approve ? pick[v.id] || undefined : undefined }) }),
    onSuccess: () => qc.invalidateQueries(), onError: (e) => toast(friendlyError(e), "error"),
  });
  return (
    <Page>
      <ScreenHead back={false} eyebrow="Admin instansi" title="Keluarga" />
      {tr.length > 0 && <h2 className="text-lg font-extrabold">Permintaan pindah ({tr.length})</h2>}
      {tr.map((r) => (
        <Card key={r.id} tone="cream" className="space-y-2">
          <div className="flex items-center gap-3"><Avatar name={r.family.replace(/^Keluarga\s+/i, "")} /><div><p className="font-extrabold">{r.family}</p><p className="text-sm font-semibold text-gold-ink">{r.children} anak{r.has_teacher ? ", pindah dari guru lain" : ", belum punya guru"}</p></div></div>
          <label className="block text-sm font-extrabold" htmlFor={`g${r.id}`}>Tetapkan guru</label>
          <select id={`g${r.id}`} value={pick[r.id] ?? ""} onChange={(e) => setPick({ ...pick, [r.id]: e.target.value })} className="min-h-[52px] w-full rounded-pill border-[3px] border-line bg-white px-4 font-bold">
            <option value="">Tetapkan nanti</option>
            {teachers.map((t) => <option key={t.id} value={t.id}>{t.name} ({t.students} murid)</option>)}
          </select>
          <div className="grid grid-cols-2 gap-2"><Btn variant="danger-outline" onClick={() => decide.mutate({ id: r.id, approve: false })}>Tolak</Btn><Btn variant="teal" onClick={() => decide.mutate({ id: r.id, approve: true })}>Setujui</Btn></div>
        </Card>
      ))}
      <h2 className="text-lg font-extrabold">Keluarga terdaftar ({fam.length})</h2>
      {fam.length === 0 && <Card tone="lav"><p className="text-sm font-semibold text-muted">Belum ada keluarga di instansi ini.</p></Card>}
      {fam.map((f) => <Card key={f.id} tone="plain" className="flex items-center gap-3"><Avatar name={f.name.replace(/^Keluarga\s+/i, "")} /><p className="min-w-0 flex-1 font-extrabold">{f.name}</p><Chip tone="lav">{f.children} anak</Chip></Card>)}
    </Page>
  );
}
