import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { api, type PetaData } from "../lib/api";

export function PetaPage() {
  const nav = useNavigate();
  const { data } = useQuery({ queryKey: ["peta"], queryFn: () => api<PetaData>("/peta/juz/30") });
  if (!data) return <div className="p-6">Memuat peta…</div>;

  return (
    <div className="min-h-dvh pb-24 pt-4">
      <div className="flex items-center gap-2 px-4">
        <Link to="/" className="rounded-full bg-white/20 px-3 py-1">
          ←
        </Link>
        <div>
          <h1 className="text-xl font-extrabold">Juz 30 · Juz Amma</h1>
          <p className="text-sm opacity-90">Urut dari An-Nas ke An-Naba</p>
        </div>
      </div>
      <div className="mx-4 mt-3 rounded-full bg-yellow-400 px-3 py-1 text-center text-sm font-bold text-purple-900">
        {data.passed_count} / {data.total_count} surah
      </div>
      <div className="relative mx-auto mt-6 flex max-w-xs flex-col items-center gap-6">
        {data.nodes.map((n) => {
          const isPassed = n.status === "passed";
          const isActive = n.status === "active";
          const isLocked = n.status === "locked";
          return (
            <div key={n.surah_id} className="flex flex-col items-center">
              <div
                className={`flex h-16 w-16 items-center justify-center rounded-full border-4 font-bold ${
                  isPassed
                    ? "border-green-300 bg-green-500"
                    : isActive
                      ? "h-20 w-20 border-blue-200 bg-blue-500 shadow-lg shadow-blue-300/50"
                      : "border-gray-400 bg-gray-500"
                }`}
              >
                {isPassed ? "✓" : isActive ? "▶" : "🔒"}
              </div>
              <p className="mt-1 text-center text-sm font-bold">
                {isActive && <span className="text-yellow-300">MULAI · </span>}
                {n.name_id} ({n.ayah_count} ayat)
              </p>
            </div>
          );
        })}
      </div>
      {data.unlock_hint && (
        <p className="mx-4 mt-4 rounded-xl bg-white/10 px-3 py-2 text-center text-sm">🔒 {data.unlock_hint}</p>
      )}
      {data.active_surah_name && (
        <div className="fixed bottom-0 left-0 right-0 mx-auto max-w-[430px] bg-primary p-4">
          <button type="button" className="btn-cta" onClick={() => nav("/ziyadah")}>
            Lanjut: {data.active_surah_name}
          </button>
        </div>
      )}
    </div>
  );
}
