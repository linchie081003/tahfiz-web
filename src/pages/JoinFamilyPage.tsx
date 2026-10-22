import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { api, setToken } from "../lib/api";

export function JoinFamilyPage() {
  const nav = useNavigate();
  const [sp] = useSearchParams();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const code = sp.get("kode") ?? "";

  const submit = async () => {
    setBusy(true);
    setErr("");
    try {
      const t = await api<{ access_token: string }>("/family/join", {
        method: "POST",
        body: JSON.stringify({ code, name, email, password }),
      });
      setToken(t.access_token);
      nav("/", { replace: true });
    } catch {
      setErr("Undangan tidak valid, sudah dipakai, atau kedaluwarsa. Minta pasangan membuat undangan baru.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-md space-y-3 p-4">
      <h1 className="text-xl font-bold">Gabung ke keluarga</h1>
      {!code && <p className="text-sm text-red-700">Tautan undangan tidak lengkap.</p>}
      <label className="block text-sm font-semibold" htmlFor="j-name">Nama</label>
      <input id="j-name" className="w-full rounded-xl border p-2" value={name} onChange={(e) => setName(e.target.value)} />
      <label className="block text-sm font-semibold" htmlFor="j-email">Email</label>
      <input id="j-email" type="email" className="w-full rounded-xl border p-2" value={email} onChange={(e) => setEmail(e.target.value)} />
      <label className="block text-sm font-semibold" htmlFor="j-pw">Kata sandi (min. 8 karakter)</label>
      <input id="j-pw" type="password" className="w-full rounded-xl border p-2" value={password} onChange={(e) => setPassword(e.target.value)} />
      {err && <p className="text-sm text-red-700">{err}</p>}
      <button type="button" className="btn-cta w-full" disabled={busy || !code || !name || !email || password.length < 8} onClick={() => void submit()}>
        Gabung
      </button>
      <Link to="/login" className="block text-center text-sm underline">Sudah punya akun? Masuk</Link>
    </div>
  );
}
