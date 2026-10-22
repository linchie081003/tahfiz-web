import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, setToken } from "../../lib/api";
import { Btn, Card, Page } from "../../components/ui/ui";
import { friendlyError, useGameToast } from "../../components/game/GameToast";

const input = "mb-3 min-h-[56px] w-full rounded-pill border-[3px] border-line px-5 text-lg font-bold outline-none focus:border-brand";

export function GuruMasukPage({ mode }: { mode: "masuk" | "daftar" }) {
  const nav = useNavigate();
  const toast = useGameToast();
  const [f, setF] = useState({ name: "", email: "", password: "", institution_code: "" });
  const [busy, setBusy] = useState(false);
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });
  const submit = async () => {
    setBusy(true);
    try {
      const body = mode === "masuk" ? { email: f.email, password: f.password } : { ...f, institution_code: f.institution_code || undefined };
      const r = await api<{ access_token: string }>(`/teacher/${mode === "masuk" ? "login" : "register"}`, { method: "POST", body: JSON.stringify(body) });
      setToken(r.access_token);
      const me = await api<{ is_admin: boolean }>("/teacher/me");
      nav(me.is_admin ? "/admin" : "/guru", { replace: true });
    } catch (e) { toast(friendlyError(e), "error"); } finally { setBusy(false); }
  };
  return (
    <div className="app-shell"><Page>
      <div className="pt-6 text-center">
        <p className="text-sm font-extrabold text-teal">Hafiz untuk guru</p>
        <h1 className="text-[30px] font-extrabold text-outline">{mode === "masuk" ? "Masuk sebagai guru" : "Daftar sebagai guru"}</h1>
      </div>
      <Card tone="plain">
        {mode === "daftar" && <input className={input} placeholder="Nama lengkap" aria-label="Nama lengkap" value={f.name} onChange={set("name")} />}
        <input className={input} type="email" placeholder="Email" aria-label="Email" value={f.email} onChange={set("email")} />
        <input className={input} type="password" placeholder="Kata sandi (min. 8 karakter)" aria-label="Kata sandi" value={f.password} onChange={set("password")} />
        {mode === "daftar" && <>
          <input className={input} placeholder="Kode instansi (jika dari sekolah/lembaga)" aria-label="Kode instansi" value={f.institution_code} onChange={set("institution_code")} />
          <p className="mb-3 text-sm font-semibold text-muted">Tanpa kode instansi, Anda terdaftar sebagai guru mandiri dan diverifikasi oleh orang tua yang mengundang Anda.</p>
        </>}
        <Btn disabled={busy || !f.email || f.password.length < 8 || (mode === "daftar" && !f.name)} onClick={submit}>{mode === "masuk" ? "Masuk" : "Daftar"}</Btn>
      </Card>
      <p className="text-center font-bold text-muted">
        {mode === "masuk" ? <>Belum punya akun? <Link className="text-brand" to="/guru/daftar">Daftar</Link></> : <>Sudah punya akun? <Link className="text-brand" to="/guru/masuk">Masuk</Link></>}
      </p>
      <p className="text-center text-sm font-semibold text-muted"><Link to="/login">Masuk sebagai orang tua atau anak</Link></p>
    </Page></div>
  );
}
