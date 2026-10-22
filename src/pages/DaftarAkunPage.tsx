import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, setToken } from "../lib/api";
import { Mascot } from "../components/game/Mascot";
import { friendlyError, useGameToast } from "../components/game/GameToast";

const FAMILY_CODE_KEY = "hafiz_family_code";

function StepBar({ step, back }: { step: number; back: () => void }) {
  return (
    <div className="flex items-center gap-3 px-4 pt-4">
      <button type="button" aria-label="Kembali" onClick={back} className="-ml-2 flex h-11 w-11 items-center justify-center text-brand">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg>
      </button>
      <p className="flex-1 text-sm font-extrabold text-brand-dark">Langkah {step} dari 3</p>
      <div className="flex w-24 gap-1.5" role="progressbar" aria-valuemin={1} aria-valuemax={3} aria-valuenow={step} aria-label={`Langkah ${step} dari 3`}>
        {[1, 2, 3].map((n) => <span key={n} className={`h-2.5 flex-1 rounded-pill ${n <= step ? "bg-brand" : "bg-lav"}`} />)}
      </div>
    </div>
  );
}
function Banner() {
  return (
    <svg aria-hidden="true" viewBox="0 0 390 80" className="w-full" preserveAspectRatio="xMidYMid slice" height="80">
      <rect width="390" height="80" fill="#FFE680" /><circle cx="90" cy="34" r="20" fill="#FFF3B8" /><rect x="40" y="22" width="9" height="9" rx="2" transform="rotate(45 44 26)" fill="#F2B01E" />
      <path d="M0 58 Q50 46 100 58 T200 58 T300 58 T390 58 V80 H0Z" fill="#7CC7BD" /><path d="M0 68 Q60 58 120 68 T240 68 T390 66 V80 H0Z" fill="#0F766E" />
    </svg>
  );
}
function RoleCard({ bg, color, title, sub, icon, onClick }: { bg: string; color: string; title: string; sub: string; icon: React.ReactNode; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex min-h-[84px] w-full items-center gap-3.5 rounded-pill py-3 pl-3 pr-4 text-left text-white" style={{ background: bg }}>
      <span className="flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-full bg-white" style={{ color }}>{icon}</span>
      <span className="flex-1"><span className="block text-[19px] font-extrabold">{title}</span><span className="block text-[13px] font-bold">{sub}</span></span>
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/25"><svg fill="#fff" width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.2v13.6a1 1 0 0 0 1.5.85l10.8-6.8a1 1 0 0 0 0-1.7L9.5 4.35A1 1 0 0 0 8 5.2z" /></svg></span>
    </button>
  );
}

/** Daftar langkah 1: pilih jenis akun (orang tua atau guru). */
export function DaftarAkunPage() {
  const nav = useNavigate();
  return (
    <div className="app-shell flex min-h-dvh flex-col bg-white">
      <StepBar step={1} back={() => nav("/login")} />
      <div className="mt-3"><Banner /></div>
      <main className="flex flex-1 flex-col gap-4 px-5 pt-5">
        <div className="flex items-center gap-3"><Mascot mood="happy" size={56} /><h1 className="text-[26px] font-extrabold leading-tight text-outline">Daftar sebagai apa?</h1></div>
        <p className="font-semibold text-muted">Anak tidak mendaftar sendiri. Orang tua membuat akun, lalu menambahkan anak.</p>
        <RoleCard bg="#0F766E" color="#0F766E" title="Orang tua" sub="Buat akun keluarga untuk satu atau lebih anak" onClick={() => nav("/daftar/orang-tua")}
          icon={<svg fill="currentColor" width="28" height="28" viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="7.5" r="4" /><path d="M1.5 20.5a7.5 7.5 0 0 1 15 0z" /><circle cx="17.5" cy="9" r="3" /><path d="M15.2 13.9c4-.5 7.3 1.4 7.3 6.6h-4.6c0-2.7-.8-4.8-2.7-6.6z" /></svg>} />
        <RoleCard bg="#4F46B5" color="#4F46B5" title="Guru" sub="Mengajar murid dari keluarga atau instansi. Perlu verifikasi." onClick={() => nav("/guru/daftar")}
          icon={<svg fill="currentColor" width="28" height="28" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 6a3 3 0 0 1 3-3h10a1 1 0 0 1 1 1v13H8a1 1 0 0 0 0 2h11v1a1 1 0 0 1-1 1H8a3 3 0 0 1-3-3z" /></svg>} />
        <p className="mt-auto pb-6 text-center font-semibold text-muted">Sudah punya akun? <Link to="/login" className="font-extrabold text-brand-dark underline">Masuk</Link></p>
      </main>
    </div>
  );
}

const field = "min-h-[56px] w-full rounded-pill border-[3px] border-line bg-white px-5 text-lg font-bold text-outline outline-none focus:border-brand";

/** Daftar langkah 2: buat akun keluarga orang tua. */
export function DaftarOrtuPage() {
  const nav = useNavigate();
  const toast = useGameToast();
  const [f, setF] = useState({ name: "", email: "", password: "", pin: "" });
  const [peran, setPeran] = useState("Ayah");
  const [busy, setBusy] = useState(false);
  const ok = f.name.trim() && /.+@.+\..+/.test(f.email) && f.password.length >= 8 && /^\d{4}$/.test(f.pin);
  const submit = async () => {
    setBusy(true);
    try {
      const t = await api<{ access_token: string; family_access_code: string }>("/auth/register-family", {
        method: "POST",
        body: JSON.stringify({ family_name: `Keluarga ${f.name.trim().split(" ")[0]}`, admin_name: `${f.name.trim()}`, admin_email: f.email.trim(), admin_password: f.password }),
      });
      setToken(t.access_token);
      try { localStorage.setItem(FAMILY_CODE_KEY, t.family_access_code); } catch { /* abaikan */ }
      await api("/members/settings-pin", { method: "PUT", body: JSON.stringify({ pin: f.pin }) }).catch(() => undefined);
      nav("/parent/persetujuan", { replace: true });
    } catch (e) { toast(friendlyError(e), "error"); } finally { setBusy(false); }
  };
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: k === "pin" ? e.target.value.replace(/\D/g, "").slice(0, 4) : e.target.value });
  return (
    <div className="app-shell min-h-dvh bg-white pb-8">
      <StepBar step={2} back={() => nav("/daftar")} />
      <div className="mt-3"><Banner /></div>
      <main className="space-y-4 px-5 pt-5">
        <h1 className="text-[26px] font-extrabold leading-tight text-outline">Buat akun keluarga</h1>
        <p className="font-semibold text-muted">Akun ini dipakai orang tua untuk memantau dan menyetujui akses guru.</p>
        <div><label htmlFor="nm" className="mb-1 block text-sm font-extrabold text-outline">Nama Anda</label><input id="nm" className={field} value={f.name} onChange={set("name")} autoComplete="name" /></div>
        <div>
          <p className="mb-1 text-sm font-extrabold text-outline" id="peran">Anda adalah</p>
          <div className="flex gap-2" role="radiogroup" aria-labelledby="peran">
            {["Ayah", "Ibu", "Wali"].map((p) => <button key={p} type="button" role="radio" aria-checked={peran === p} onClick={() => setPeran(p)} className={`min-h-[48px] flex-1 rounded-pill font-extrabold ${peran === p ? "bg-brand text-white" : "bg-lav text-brand-dark"}`}>{p}</button>)}
          </div>
          <p className="mt-1 text-sm font-semibold text-muted">Pasangan bisa diundang nanti dan punya akun sendiri.</p>
        </div>
        <div><label htmlFor="em" className="mb-1 block text-sm font-extrabold text-outline">Email</label><input id="em" type="email" className={field} value={f.email} onChange={set("email")} autoComplete="email" /></div>
        <div><label htmlFor="pw" className="mb-1 block text-sm font-extrabold text-outline">Kata sandi</label><input id="pw" type="password" className={field} value={f.password} onChange={set("password")} autoComplete="new-password" placeholder="Minimal 8 karakter" /></div>
        <div>
          <label htmlFor="pin" className="mb-1 block text-sm font-extrabold text-outline">PIN area orang tua (4 angka)</label>
          <input id="pin" inputMode="numeric" type="password" className={field} value={f.pin} onChange={set("pin")} autoComplete="off" />
          <p className="mt-1 text-sm font-semibold text-muted">PIN mencegah anak membuka pengaturan dan data keluarga.</p>
        </div>
        <button type="button" disabled={busy || !ok} onClick={() => void submit()} className="flex min-h-[56px] w-full items-center justify-center rounded-pill bg-brand text-lg font-extrabold text-white disabled:opacity-50">Lanjut</button>
        <p className="text-center text-xs font-semibold text-muted">Dengan melanjutkan, Anda menyetujui Syarat penggunaan dan Kebijakan privasi.</p>
      </main>
    </div>
  );
}
