import { useQuery, useQueryClient } from "@tanstack/react-query";
import { GameHeader } from "../components/game/GameHeader";
import { Mascot } from "../components/game/Mascot";
import { AppPage } from "../components/layout/AppPage";
import { api } from "../lib/api";

type Item = { id: string; surah_name: string; due_date: string };

const RATINGS = [
  { id: "lancar", label: "Kuat", hint: "Lancar", cls: "bg-teal text-white" },
  { id: "ragu", label: "Cukup", hint: "Masih ragu", cls: "bg-gold text-gold-ink" },
  { id: "lupa", label: "Lemah", hint: "Lupa", cls: "bg-coral text-white" },
] as const;

export function MurojaahPage() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["murojaah"], queryFn: () => api<Item[]>("/murojaah/due") });
  const complete = async (id: string, rating: string) => {
    await api(`/murojaah/${id}/complete`, { method: "POST", body: JSON.stringify({ rating }) });
    qc.invalidateQueries({ queryKey: ["murojaah"] });
    qc.invalidateQueries({ queryKey: ["home"] });
  };
  return (
    <AppPage>
      <GameHeader title="Murajaah" to="/" />
      {!data?.length && (
        <div className="flex items-center gap-3 rounded-[28px] bg-cream p-4">
          <Mascot mood="happy" size={72} />
          <p className="font-extrabold text-outline">Tidak ada murajaah hari ini. Hebat, sampai jumpa besok!</p>
        </div>
      )}
      {data?.map((it) => (
        <div key={it.id} className="space-y-3 rounded-[28px] bg-brand-light p-4">
          <div>
            <p className="text-xl font-extrabold text-outline">{it.surah_name}</p>
            <p className="text-sm font-semibold text-muted">Jatuh tempo: {it.due_date}</p>
          </div>
          <p className="text-sm font-bold text-outline">Seberapa kuat hafalanmu?</p>
          <div className="grid grid-cols-3 gap-2">
            {RATINGS.map((r) => (
              <button key={r.id} type="button" className={`min-h-[56px] rounded-[22px] px-2 text-base font-extrabold ${r.cls}`} onClick={() => complete(it.id, r.id)}>
                {r.label}
                <span className="block text-[11px] font-semibold opacity-90">{r.hint}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </AppPage>
  );
}
