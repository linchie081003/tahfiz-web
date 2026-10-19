import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { api } from "../lib/api";

type Item = { id: string; surah_name: string; due_date: string };

export function MurojaahPage() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["murojaah"], queryFn: () => api<Item[]>("/murojaah/due") });
  const complete = async (id: string, rating: string) => {
    await api(`/murojaah/${id}/complete`, { method: "POST", body: JSON.stringify({ rating }) });
    qc.invalidateQueries({ queryKey: ["murojaah"] });
    qc.invalidateQueries({ queryKey: ["home"] });
  };
  return (
    <div className="space-y-4 p-4">
      <Link to="/" className="text-white underline">
        ← Home
      </Link>
      <h1 className="text-2xl font-extrabold">Murojaah</h1>
      {!data?.length && <p className="text-white/90">Tidak ada jadwal hari ini.</p>}
      {data?.map((it) => (
        <div key={it.id} className="card-surface p-4">
          <p className="font-bold">{it.surah_name}</p>
          <p className="text-sm text-gray-600">Jatuh tempo: {it.due_date}</p>
          <div className="mt-2 flex gap-2">
            {(["lancar", "ragu", "lupa"] as const).map((r) => (
              <button key={r} type="button" className="rounded-xl bg-purple-100 px-3 py-1 text-sm font-bold" onClick={() => complete(it.id, r)}>
                {r}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
