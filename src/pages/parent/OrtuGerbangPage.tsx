import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, setToken } from "../../lib/api";
import { Mascot } from "../../components/game/Mascot";
import { Btn } from "../../components/ui/ui";

/** Masuk ke area orang tua dari tampilan anak, dilindungi PIN 4 angka. */
export function OrtuGerbangPage() {
  const nav = useNavigate();
  const [pin, setPin] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const press = (d: string) => { setErr(""); setPin((p) => (p.length < 4 ? p + d : p)); };
  const enter = async () => {
    setBusy(true);
    try {
      try { await api("/members/verify-settings-pin", { method: "POST", body: JSON.stringify({ pin }) }); }
      catch (e) {
        if (!String((e as Error).message).includes("belum diatur")) throw e;
      }
      const t = await api<{ access_token: string }>("/members/exit-impersonate", { method: "POST" });
      setToken(t.access_token);
      window.location.replace("/parent");
    } catch { setErr("PIN salah. Coba lagi."); setPin(""); } finally { setBusy(false); }
  };
  return (
    <div className="app-shell space-y-4 px-4 pt-6 text-center">
      <button type="button" onClick={() => nav("/")} className="block min-h-[44px] text-left text-lg font-extrabold text-brand">‹ Kembali ke belajar</button>
      <Mascot mood="default" size={80} className="mx-auto" />
      <p className="text-sm font-extrabold text-muted">Area orang tua</p>
      <h1 className="text-2xl font-extrabold">Masukkan PIN 4 angka</h1>
      <div className="flex justify-center gap-3" aria-label={`${pin.length} dari 4 angka`}>
        {[0, 1, 2, 3].map((i) => <span key={i} className={`h-5 w-5 rounded-full ${i < pin.length ? "bg-brand" : "bg-lav"}`} />)}
      </div>
      {err && <p role="alert" className="font-extrabold text-[#B3261E]">{err}</p>}
      <div className="mx-auto grid max-w-[300px] grid-cols-3 gap-3">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => <button key={d} type="button" onClick={() => press(d)} className="h-16 rounded-full bg-lav text-2xl font-extrabold text-brand-dark">{d}</button>)}
        <button type="button" aria-label="Hapus" onClick={() => setPin((p) => p.slice(0, -1))} className="h-16 rounded-full text-xl font-extrabold text-muted">⌫</button>
        <button type="button" onClick={() => press("0")} className="h-16 rounded-full bg-lav text-2xl font-extrabold text-brand-dark">0</button>
      </div>
      <Btn disabled={pin.length !== 4 || busy} onClick={enter}>Masuk</Btn>
    </div>
  );
}
