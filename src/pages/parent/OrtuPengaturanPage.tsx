import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { api } from "../../lib/api";
import { friendlyError, useGameToast } from "../../components/game/GameToast";
import { Page, ScreenHead } from "../../components/ui/ui";
import { useLogout } from "../../lib/auth";
import { loadQuranPrefs } from "../../lib/quranPrefs";

type Child = { id: string; name: string };
type Fam = { reminder_hour?: number; daily_murojaah_cap?: number; parent_can_evaluate?: boolean };
const QARI: Record<string, string> = { husary_muallim: "Al-Husary, Mu'allim", husary: "Al-Husary, murattal", minshawi: "Al-Minshawi, murattal", minshawi_mujawwad: "Al-Minshawi, mujawwad" };
const sel = "min-h-[52px] w-full rounded-pill border-[3px] border-line bg-white px-4 font-bold text-outline outline-none focus:border-brand";

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
const Item = ({ to, title, sub }: { to: string; title: string; sub?: string }) => (
  <Link to={to} className="flex min-h-[56px] items-center gap-2 rounded-[20px] bg-white px-4 font-extrabold text-outline"><span className="min-w-0 flex-1">{title}{sub && <span className="block text-sm font-semibold text-muted">{sub}</span>}</span><span className="text-brand">›</span></Link>
);

/** Orang tua: pengaturan global keluarga. Pengaturan tiap anak ada di profil anak. */
export function OrtuPengaturanPage() {
  const qc = useQueryClient();
  const toast = useGameToast();
  const logout = useLogout();
  const kids = useQuery({ queryKey: ["parent-dashboard-kids"], queryFn: async () => (await api<{ children: Child[] }>("/parent/dashboard")).children });
  const fam = useQuery({ queryKey: ["settings"], queryFn: () => api<Fam>("/settings/family"), retry: false });
  const prefs = loadQuranPrefs();
  const patch = async (body: object, msg: string) => {
    try { await api("/settings/family", { method: "PATCH", body: JSON.stringify(body) }); await qc.invalidateQueries({ queryKey: ["settings"] }); toast(msg, "success"); }
    catch (e) { toast(friendlyError(e), "error"); }
  };
  return (
    <Page>
      <ScreenHead back={false} eyebrow="Area orang tua" title="Pengaturan" sub="Berlaku untuk seluruh keluarga." />
      <div className="space-y-2">
        <Row to="/parent/keluarga" icon="👪" title="Anggota keluarga" sub="Ayah, Ibu, dan anak" tone="bg-brand" />
        <Row to="/parent/instansi" icon="🏫" title="Pindah ke instansi" sub="Gabung ke TPQ atau sekolah dengan kode" tone="bg-[#6C63C9]" />
      </div>

      <Group title="Profil anak">
        <p className="text-sm font-semibold text-muted">Mode usia, cakupan hafalan, guru, dan privasi suara diatur per anak.</p>
        {kids.data?.map((k) => <Item key={k.id} to={`/parent/anak/${k.id}`} title={k.name} sub="Pengaturan profil anak" />)}
        {kids.isSuccess && !kids.data.length && <p className="font-bold text-outline">Belum ada profil anak.</p>}
        <Link to="/parent/tambah-anak" className="flex min-h-[52px] items-center justify-center rounded-pill border-[3px] border-brand bg-white font-extrabold text-brand-dark">+ Tambah anak</Link>
      </Group>

      <Group title="Pengingat dan batas harian">
        <label className="block text-sm font-extrabold text-outline" htmlFor="jam">Pengingat belajar (semua anak)</label>
        <select id="jam" className={sel} value={fam.data?.reminder_hour ?? 17} onChange={(e) => void patch({ reminder_hour: Number(e.target.value) }, "Jam pengingat tersimpan.")}>
          {Array.from({ length: 16 }, (_, i) => i + 6).map((h) => <option key={h} value={h}>Setiap hari pukul {String(h).padStart(2, "0")}.00</option>)}
        </select>
        <label className="block text-sm font-extrabold text-outline" htmlFor="cap">Batas murajaah per hari (item)</label>
        <select id="cap" className={sel} value={fam.data?.daily_murojaah_cap ?? 5} onChange={(e) => void patch({ daily_murojaah_cap: Number(e.target.value) }, "Batas murajaah tersimpan.")}>
          {[3, 5, 8, 10, 15, 20].map((n) => <option key={n} value={n}>{n} item</option>)}
        </select>
      </Group>

      <Group title="Penilaian setoran">
        <label className="flex min-h-[56px] items-center gap-3 rounded-[20px] bg-white px-4 font-extrabold text-outline" htmlFor="pce">
          <input id="pce" type="checkbox" className="h-6 w-6" checked={fam.data?.parent_can_evaluate ?? true} onChange={(e) => void patch({ parent_can_evaluate: e.target.checked }, "Pengaturan penilaian tersimpan.")} />
          <span className="flex-1">Orang tua boleh menilai setoran<span className="block text-sm font-semibold text-muted">Jika dimatikan, hanya guru yang terhubung yang menilai. Penilaian lama tetap tersimpan.</span></span>
        </label>
      </Group>

      <Group title="Suara dan tampilan">
        <Item to="/settings" title="Qari, kecepatan audio, tampilan Arab" sub={QARI[prefs.reciterId] ?? prefs.reciterId} />
        <Item to="/parent/pesan" title="Pesan guru" sub="Catatan dari guru untuk keluarga" />
      </Group>

      <button type="button" onClick={logout} className="flex min-h-[56px] w-full items-center justify-center rounded-pill border-[3px] border-brand bg-white text-lg font-extrabold text-brand-dark">Keluar</button>
    </Page>
  );
}
