import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../../lib/api";
import { friendlyError, useGameToast } from "../../components/game/GameToast";
import { Page, ScreenHead } from "../../components/ui/ui";
import { AGE_MODE_OPTIONS } from "../../lib/ageModeOptions";

type Child = { id: string; name: string; age_mode?: string };
type MS = { coverage: string; daily_ayahs: number; murajaah_strong_days: number; set_by: string };
type TeacherRes = { link: { status: string; teacher: { name?: string; verified?: boolean } } | null };
const sel = "min-h-[52px] w-full rounded-pill border-[3px] border-line bg-white px-4 font-bold text-outline outline-none focus:border-brand disabled:opacity-60";
function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="space-y-3 rounded-[28px] bg-brand-light p-5"><h2 className="text-lg font-extrabold text-brand-dark">{title}</h2>{children}</section>;
}
const Item = ({ to, title, sub }: { to: string; title: string; sub?: string }) => (
  <Link to={to} className="flex min-h-[56px] items-center gap-2 rounded-[20px] bg-white px-4 font-extrabold text-outline"><span className="min-w-0 flex-1">{title}{sub && <span className="block text-sm font-semibold text-muted">{sub}</span>}</span><span className="text-brand">›</span></Link>
);
const L = ({ id, children }: { id: string; children: React.ReactNode }) => <label className="block text-sm font-extrabold text-outline" htmlFor={id}>{children}</label>;

/** Orang tua: pengaturan satu profil anak (mode usia, cakupan, guru, privasi suara). */
export function OrtuAnakPage() {
  const { id = "" } = useParams();
  const qc = useQueryClient();
  const toast = useGameToast();
  const [busy, setBusy] = useState(false);
  const kids = useQuery({ queryKey: ["parent-dashboard-kids"], queryFn: async () => (await api<{ children: Child[] }>("/parent/dashboard")).children });
  const kid = kids.data?.find((k) => k.id === id);
  const ms = useQuery({ queryKey: ["member-settings", id], queryFn: () => api<MS>(`/members/${id}/settings`), enabled: !!id });
  const teacher = useQuery({ queryKey: ["member-teacher", id], queryFn: () => api<TeacherRes>(`/family/members/${id}/teacher`), enabled: !!id, retry: false });
  const link = teacher.data?.link;
  const locked = link?.status === "active";
  const tname = link?.teacher?.name ?? "guru";
  const name = kid?.name ?? "anak";
  const d = ms.data;

  const run = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    try { await fn(); await qc.invalidateQueries(); toast("Tersimpan.", "success"); }
    catch (e) { toast(friendlyError(e), "error"); } finally { setBusy(false); }
  };
  const put = (patch: Partial<Omit<MS, "set_by">>) => run(() => api(`/members/${id}/settings`, { method: "PUT", body: JSON.stringify(patch) }));

  return (
    <Page>
      <ScreenHead to="/parent/pengaturan" eyebrow="Profil anak" title={`Pengaturan ${name}`} />
      {kids.isSuccess && !kid && <p className="rounded-[24px] bg-lav p-4 font-bold">Profil anak tidak ditemukan.</p>}
      {kid && (
        <>
          <Group title="Mode usia">
            <L id="usia">Tingkat belajar {name}</L>
            <select id="usia" className={sel} disabled={busy} value={kid.age_mode ?? "sd"} onChange={(e) => void run(() => api(`/members/${id}`, { method: "PATCH", body: JSON.stringify({ age_mode: e.target.value }) }))}>
              {AGE_MODE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <p className="text-sm font-semibold text-muted">PAUD dan SD memakai qari Muallim (Husary); remaja dan dewasa memakai murattal.</p>
          </Group>

          <Group title="Cakupan dan kecepatan hafalan">
            {d && (
              <>
                <L id="cak">Cakupan</L>
                <select id="cak" className={sel} disabled={busy || locked} value={d.coverage} onChange={(e) => void put({ coverage: e.target.value })}>
                  <option value="juz30">Juz 30</option><option value="all">Seluruh 114 surat</option>
                </select>
                <L id="kec">Hafalan baru</L>
                <select id="kec" className={sel} disabled={busy || locked} value={d.daily_ayahs} onChange={(e) => void put({ daily_ayahs: Number(e.target.value) })}>
                  {[1, 2, 3, 5].map((n) => <option key={n} value={n}>{n} ayat per hari{n === 1 ? " (bawaan)" : ""}</option>)}
                </select>
                <L id="jed">Jeda murajaah kuat</L>
                <select id="jed" className={sel} disabled={busy || locked} value={d.murajaah_strong_days} onChange={(e) => void put({ murajaah_strong_days: Number(e.target.value) })}>
                  <option value={14}>14 hari (bawaan)</option><option value={7}>7 hari</option>
                </select>
              </>
            )}
            {locked
              ? <p className="rounded-[20px] bg-brand p-3 text-sm font-bold text-white">🔒 Diatur oleh {tname}{link?.teacher?.verified ? " (Terverifikasi)" : ""} untuk {name}. Anda hanya bisa melihat.</p>
              : <p className="text-sm font-semibold text-muted">Belum ada guru, jadi bagian ini bisa Anda atur sendiri. Setelah guru terhubung, guru yang mengatur.</p>}
          </Group>

          <Group title="Guru">
            <p className="text-sm font-semibold text-muted">{link ? (locked ? `Guru pembimbing: ${tname}.` : link.status === "requested" ? `Menunggu ${tname} menerima permintaan.` : "Permintaan terakhir tidak diterima.") : `Belum ada guru untuk ${name}.`}</p>
            <Link to="/parent/guru" className="flex min-h-[52px] items-center justify-center rounded-pill border-[3px] border-brand bg-white font-extrabold text-brand-dark">{locked ? "Tinjau atau ganti guru" : "Hubungkan guru"}</Link>
          </Group>

          <Group title="Privasi dan keamanan">
            <Item to="/parent/privasi" title={`Privasi suara ${name}`} sub="Izin guru, hapus rekaman, unduh data" />
          </Group>
        </>
      )}
    </Page>
  );
}
