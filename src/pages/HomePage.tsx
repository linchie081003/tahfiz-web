import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { LogoutButton } from "../components/LogoutButton";
import { MissionCard } from "../components/MissionCard";
import { MenuGrid9 } from "../components/MenuGrid9";
import { api, type HomeData } from "../lib/api";

export function HomePage() {
  const session = useQuery({
    queryKey: ["session"],
    queryFn: () => api<{ role: string }>("/auth/session"),
  });
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["home"],
    queryFn: () => api<HomeData>("/home"),
  });
  if (isError) {
    return (
      <div className="space-y-2 p-8 text-center text-white">
        <p className="font-bold">Tidak bisa memuat Home</p>
        <p className="text-sm opacity-90">{error instanceof Error ? error.message : String(error)}</p>
      </div>
    );
  }
  if (isLoading || !data) return <div className="p-8 text-center text-white">Memuat…</div>;

  return (
    <div className="pb-6 pt-6">
      <div className="mb-4 flex items-start justify-between px-4">
        <h1 className="text-2xl font-extrabold">Halo, {data.greeting_name}</h1>
        <div className="flex gap-2 text-sm font-bold">
          <span className="rounded-xl bg-white/20 px-2 py-1">📅 {data.streak_days}</span>
          <span className="rounded-xl bg-white/20 px-2 py-1">⭐ {data.xp}</span>
        </div>
      </div>
      <MissionCard home={data} />
      <div className="mx-4 mt-4 text-white">
        <p className="font-bold">
          Level {data.level} · {data.rank_title}
        </p>
        <div className="mt-1 h-3 overflow-hidden rounded-full bg-white/30">
          <div className="h-full rounded-full bg-cta" style={{ width: `${data.level_progress * 100}%` }} />
        </div>
        <p className="mt-1 text-sm opacity-90">
          {data.xp} / {data.xp_next_level} XP
        </p>
      </div>
      <MenuGrid9 home={data} />
      <div className="space-y-2 px-4 text-center text-sm">
        <Link to="/parent/queue" className="block underline opacity-90">
          Mode orang tua: antrean penilaian
        </Link>
        {session.data?.role === "parent" && (
          <Link to="/pilih-profil" className="block underline opacity-80">
            Ganti profil anak
          </Link>
        )}
        <Link to="/settings" className="block underline opacity-80">
          Pengaturan
        </Link>
        <LogoutButton
          label="Keluar"
          className="mx-auto block text-sm underline opacity-80"
        />
      </div>
    </div>
  );
}
