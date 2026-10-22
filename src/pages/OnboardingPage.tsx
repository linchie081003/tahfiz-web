import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { Mascot } from "../components/game/Mascot";
import { Btn } from "../components/ui/ui";
import { friendlyError, useGameToast } from "../components/game/GameToast";

const OPTS = [
  { id: "none", t: "Belum kenal huruf", d: "Mulai dari Pulau 1" },
  { id: "basic", t: "Kenal huruf, belum lancar", d: "Mulai dari Pulau 1, guru atau orang tua menilai kecepatannya" },
  { id: "fluent", t: "Sudah lancar membaca", d: "Mulai dari Pulau 1; guru bisa melompatkan ke pulau yang sesuai" },
] as const;

/** Tingkat bacaan awal. Hanya penanda: pulau yang dilalui tetap diputuskan guru atau orang tua. */
export function OnboardingPage() {
  const nav = useNavigate();
  const qc = useQueryClient();
  const toast = useGameToast();
  const [sel, setSel] = useState<string>("none");
  const [busy, setBusy] = useState(false);
  const go = async () => {
    setBusy(true);
    try {
      await api("/placement", { method: "PUT", body: JSON.stringify({ level: sel }) });
      await qc.invalidateQueries({ queryKey: ["placement"] });
      nav("/", { replace: true });
    } catch (e) { toast(friendlyError(e), "error"); } finally { setBusy(false); }
  };
  return (
    <div className="app-shell space-y-4 px-4 pb-10 pt-6 text-center">
      <Mascot mood="excited" size={96} className="mx-auto" />
      <h1 className="text-[28px] font-extrabold">Selamat datang!</h1>
      <p className="text-lg font-bold text-muted">Bacaanmu sekarang sampai mana?</p>
      <div className="space-y-2 text-left" role="radiogroup" aria-label="Tingkat bacaan awal">
        {OPTS.map((o) => (
          <button key={o.id} type="button" role="radio" aria-checked={sel === o.id} onClick={() => setSel(o.id)}
            className={`w-full rounded-[24px] p-4 ${sel === o.id ? "bg-brand text-white ring-[3px] ring-gold ring-offset-2" : "bg-lav text-outline"}`}>
            <span className="block text-lg font-extrabold">{o.t}</span>
            <span className={`block text-sm font-semibold ${sel === o.id ? "opacity-90" : "text-muted"}`}>{o.d}</span>
          </button>
        ))}
      </div>
      <p className="text-sm font-bold text-muted">Pilihan ini bisa diubah oleh guru kapan saja.</p>
      <Btn disabled={busy} onClick={go}>Lanjut</Btn>
    </div>
  );
}
