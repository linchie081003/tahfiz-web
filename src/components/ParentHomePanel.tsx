import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { GameCard } from "./game/GameCard";
import { IconStar } from "./icons/GameIcons";
import { StatusBadge } from "./game/StatusBadge";
import { formatFamilyCodeDisplay } from "../lib/familyCode";
import { api } from "../lib/api";

type ChildSummary = {
  id: string;
  name: string;
  color: string;
  pending_setor: number;
  tahsin_status: string;
  xp: number;
};

type Dashboard = {
  family_name: string;
  family_access_code: string;
  queue_total: number;
  children: ChildSummary[];
};

export function ParentQueueBanner({ count, className = "" }: { count: number; className?: string }) {
  const pending = count > 0;
  return (
    <Link
      to="/parent/queue"
      className={`mx-0 mb-3 flex items-center gap-3 rounded-card border-[3px] px-4 py-3 shadow-game-sm transition active:scale-[0.99] ${
        pending ? "border-game-coral bg-gradient-to-r from-game-coral/25 to-white" : "border-outline/30 bg-white/90"
      } ${className}`}
    >
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-outline ${
          pending ? "bg-game-coral/30" : "bg-brand-light"
        }`}
      >
        <IconStar size={20} decorative />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-extrabold text-outline">Antrean penilaian</span>
        <span className="block text-xs font-semibold text-outline/80">
          {pending ? `${count} setoran menunggu — ketuk untuk nilai` : "Tidak ada setoran menunggu"}
        </span>
      </span>
      <span
        className={`flex h-9 min-w-9 items-center justify-center rounded-full border-2 border-outline px-2 text-sm font-extrabold ${
          pending ? "bg-game-coral text-white" : "bg-game-locked text-outline/70"
        }`}
        aria-label={`${count} antrean`}
      >
        {count}
      </span>
    </Link>
  );
}

export function ParentHomeDashboard({ onCollapse }: { onCollapse?: () => void }) {
  const { data, isLoading } = useQuery({
    queryKey: ["parent-dashboard"],
    queryFn: () => api<Dashboard>("/parent/dashboard"),
    staleTime: 30_000,
  });

  if (isLoading || !data) {
    return (
      <GameCard className="mb-6">
        <p className="text-sm font-semibold text-outline">Memuat dashboard…</p>
      </GameCard>
    );
  }

  return (
    <GameCard className="mb-6 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-brand">Dashboard keluarga</p>
          <p className="text-lg font-extrabold text-outline">{data.family_name}</p>
          <p className="font-mono text-sm tracking-widest text-outline/80">
            Kode anak: {formatFamilyCodeDisplay(data.family_access_code)}
          </p>
        </div>
        <button
          type="button"
          onClick={onCollapse}
          className="flex shrink-0 flex-col items-center gap-0.5 rounded-game border-2 border-outline bg-white px-2 py-1.5 text-[10px] font-extrabold text-outline shadow-game-sm active:scale-95"
          aria-expanded
          aria-label="Sembunyikan dashboard"
        >
          <span className="text-base leading-none" aria-hidden>
            ▲
          </span>
          Tutup
        </button>
      </div>

      {!data.children.length ? (
        <p className="text-sm font-semibold text-outline/90">Belum ada profil anak.</p>
      ) : (
        <ul className="space-y-2">
          {data.children.map((c) => (
            <li
              key={c.id}
              className="flex items-center gap-3 rounded-game border-2 border-outline/15 bg-brand-light/30 px-3 py-2"
            >
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-outline text-sm font-bold text-white"
                style={{ backgroundColor: c.color }}
              >
                {c.name.charAt(0)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-extrabold text-outline">{c.name}</p>
                <div className="mt-1 flex flex-wrap items-center gap-1.5">
                  <StatusBadge kind="tahsin" code={c.tahsin_status} size="sm" compact />
                  <span className="text-xs font-semibold text-outline/75">{c.xp} XP</span>
                  {c.pending_setor > 0 && (
                    <span className="text-xs font-bold text-game-coral">{c.pending_setor} setoran</span>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap gap-2 pt-1">
        <Link to="/parent" className="text-xs font-bold text-brand underline">
          Dashboard lengkap
        </Link>
        <Link to="/pilih-profil" className="text-xs font-bold text-outline/80 underline">
          Kelola profil
        </Link>
      </div>
    </GameCard>
  );
}
