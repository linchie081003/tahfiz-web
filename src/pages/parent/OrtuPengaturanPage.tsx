import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../lib/api";
import { friendlyError, useGameToast } from "../../components/game/GameToast";
import { Page, ScreenHead } from "../../components/ui/ui";
import { useLogout } from "../../lib/auth";
import { loadQuranPrefs } from "../../lib/quranPrefs";

type Child = { id: string; name: string };
type MS = { coverage: string; daily_ayahs: number; murajaah_strong_days: number; set_by: string };
type TeacherRes = { link: { status: string; teacher: { name?: string; verified?: boolean } } | null };
const QARI: Record<string, string> = { husary_muallim: "Al-Husary, Mu'allim", husary: "Al-Husary, murattal", minshawi: "Al-Minshawi, murattal", minshawi_mujawwad: "Al-Minshawi, mujawwad" };

const sel = "min-h-[52px] w-full rounded-pill border-[3px] border-line bg-white px-4 font-bold text-outline outline-none focus:border-brand disabled:opacity-60";
function Row({ to, icon, title, sub, tone }: { to: string; icon: string; title: string; sub: string; tone: string }) {
  return (
    <Link to={to} className={`flex min-h-[64px] items-center gap-3 rounded-[24px] px-4 py-3 text-white ${tone}`}>
      <span className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-white/25 text-xl" aria-hidden="true">{icon}</span>
      <span className="min-w-0 flex-1"><span className="block font-extrabold">{title}</span><span className="block text-sm font-semibold opacity-90">{sub}</span></span>
      <span className="text-2xl font-extrabold" aria-hidden="true">›</span>
    </Link>
  );
}
function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="space-y-3 rounded-[28px] bg-brand-light p-5"><h2 className="text-lg font-extrabold text-brand-dark">{title}</h2>{children}</section>;
}

/** Orang tua: pengaturan per anak (sesuai design OrtuPengaturan). */
export function OrtuPengaturanPage() {
  const qc = useQueryClient();
  const toast = useGameToast();
  const logout = useLogout();
  const kids = useQuery({ queryKey: ["parent-dashboard-kids"], queryFn: async () => (await api<{ children: Child[] }>("/parent/dashboard")).children });
  const [picked, setPicked] = useState<string | null>(null);
  const id = picked ?? kids.data?.[0]?.id ?? null;
  const name = kids.data?.find((k) => k.id === id)?.name ?? "anak";
  const ms = useQuery({ queryKey: ["member-settings", id], queryFn: () => api<MS>(`/members/${id}/settings`), enabled: !!id });
  const teacher = useQuery({ queryKey: ["member-teacher", id], queryFn: () => api<TeacherRes>(`/family/members/${id}/teacher`), enabled: !!id, retry: false });
  const fam = useQuery({ queryKey: ["settings"], queryFn: () => api<{ reminder_hour?: number }>("/settings/family"), retry: false });
  const link = teacher.data?.link;
  const locked = link?.status === "active";
  const tname = link?.teacher?.name ?? "guru";
  const [busy, setBusy] = useState(false);
  const prefs = loadQuranPrefs();

  const update = async (patch: Partial<Omit<MS, "set_by">>) => {
    if (!id) return;
    setBusy(true);
    try {
      await api(`/members/${id}/settings`, { method: "PUT", body: JSON.stringify(patch) });
      await qc.invalidateQueries({ queryKey: ["member-settings", id] });
      await qc.invalidateQueries({ queryKey: ["home"] });
      toast("Tersimpan.", "success");
    } catch (e) { toast(friendlyError(e), "error"); } finally { setBusy(false); }
  };
  const saveHour = async (h: number) => {
    try { await api("/settings/family", { method: "PATCH", body: JSON.stringify({ reminder_hour: h }) }); await qc.invalidateQueries({ queryKey: ["settings"] }); toast("Jam pengingat tersimpan.", "success"); }
    catch (e) { toast(friendlyError(e), "error"); }
  };
  const d = ms.data;

  return (
    <Page>
      <ScreenHead back={false} eyebrow="Area orang tua" title={`Pengaturan ${name}`} />
      {kids.data && kids.data.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {kids.data.map((k) => (
            <button key={k.id} type="button" aria-pressed={k.id === id} onClick={() => setPicked(k.id)}
              className={`min-h-[44px] rounded-pill px-4 font-extrabold ${k.id === id ? "bg-teal text-white" : "bg-lav text-brand-dark"}`}>{k.name}</button>
          ))}
        </div>
      )}
      {kids.isSuccess && !kids.data.length && <p className="rounded-[24px] bg-lav p-4 font-bold">Belum ada profil anak. Tambahkan anak dulu.</p>}

      <div className="space-y-2">
        <Row to="/parent/keluarga" icon="👪" title="Anggota keluarga" sub="Ayah, Ibu, dan anak" tone="bg-brand" />
        <Row to="/parent/instansi" icon="🏫" title="Pindah ke instansi" sub="Gabung ke TPQ atau sekolah dengan kode" tone="bg-[#6C63C9]" />
      </div>

      {id && (
        <>
          <Group title="Waktu belajar">
            <label className="block text-sm font-extrabold text-outline" htmlFor="jam">Pengingat belajar</label>
            <select id="jam" className={sel} value={fam.data?.reminder_hour ?? 17} onChange={(e) => void saveHour(Number(e.target.value))}>
              {Array.from({ length: 16 }, (_, i) => i + 6).map((h) => <option key={h} value={h}>Setiap hari pukul {String(h).padStart(2, "0")}.00</option>)}
            </select>
          </Group>

          <Group title="Cakupan dan kecepatan hafalan">
            {d && (
              <>
                <label className="block text-sm font-extrabold text-outline" htmlFor="cak">Cakupan</label>
                <select id="cak" className={sel} disabled={busy || locked} value={d.coverage} onChange={(e) => void update({ coverage: e.target.value })}>
                  <option value="juz30">Juz 30</option><option value="all">Seluruh 114 surat</option>
                </select>
                <label className="block text-sm font-extrabold text-outline" htmlFor="kec">Hafalan baru</label>
                <select id="kec" className={sel} disabled={busy || locked} value={d.daily_ayahs} onChange={(e) => void update({ daily_ayahs: Number(e.target.value) })}>
                  {[1, 2, 3, 5].map((n) => <option key={n} value={n}>{n} ayat per hari{n === 1 ? " (bawaan)" : ""}</option>)}
                </select>
                <label className="block text-sm font-extrabold text-outline" htmlFor="jed">Jeda murajaah kuat</label>
                <select id="jed" className={sel} disabled={busy || locked} value={d.murajaah_strong_days} onChange={(e) => void update({ murajaah_strong_days: Number(e.target.value) })}>
                  <option value={14}>14 hari (bawaan)</option><option value={7}>7 hari</option>
                </select>
              </>
            )}
            {locked ? (
              <p className="rounded-[20px] bg-brand p-3 text-sm font-bold text-white">🔒 Diatur oleh {tname}{link?.teacher?.verified ? " (Terverifikasi)" : ""} untuk {name}. Anda hanya bisa melihat.</p>
            ) : (
              <p className="text-sm font-semibold text-muted">Belum ada guru, jadi bagian ini bisa Anda atur sendiri. Setelah guru terhubung, guru yang mengatur.</p>
            )}
            <Link to="/parent/guru" className="flex min-h-[52px] items-center justify-center rounded-pill border-[3px] border-brand bg-white font-extrabold text-brand-dark">{locked ? "Minta guru mengubah" : "Hubungkan guru"}</Link>
          </Group>

          <Group title="Suara contoh (qari)">
            <Link to="/settings" className="flex min-h-[56px] items-center gap-2 rounded-[20px] bg-white px-4 font-extrabold text-outline"><span className="flex-1">Belajar dan tilawah<span className="block text-sm font-semibold text-muted">{QARI[prefs.reciterId] ?? prefs.reciterId}</span></span><span className="text-brand">›</span></Link>
          </Group>

          <Group title="Privasi dan keamanan">
            <Link to="/parent/privasi" className="flex min-h-[56px] items-center gap-2 rounded-[20px] bg-white px-4 font-extrabold text-outline"><span className="flex-1">Privasi suara {name}<span className="block text-sm font-semibold text-muted">Izin guru, hapus rekaman, unduh data</span></span><span className="text-brand">›</span></Link>
            <Link to="/settings" className="flex min-h-[56px] items-center gap-2 rounded-[20px] bg-white px-4 font-extrabold text-outline"><span className="flex-1">Pengaturan tampilan dan notifikasi</span><span className="text-brand">›</span></Link>
          </Group>
        </>
      )}
      <button type="button" onClick={logout} className="flex min-h-[56px] w-full items-center justify-center rounded-pill border-[3px] border-brand bg-white text-lg font-extrabold text-brand-dark">Keluar</button>
    </Page>
  );
}
