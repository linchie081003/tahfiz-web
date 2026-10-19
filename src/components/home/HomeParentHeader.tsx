import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { GameCard } from "../game/GameCard";
import { StatusBadge } from "../game/StatusBadge";
import { IconStar } from "../icons/GameIcons";
import { formatFamilyCodeDisplay } from "../../lib/familyCode";
import { modeBadgeClass } from "../../lib/rankDisplay";
import { api } from "../../lib/api";

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

type Props = {
  name: string;
  memberId?: string | null;
  memberName?: string | null;
  dashOpen: boolean;
  onOpenDash: () => void;
  onCloseDash: () => void;
  queueTotal: number;
};

function QueueRow({ count }: { count: number }) {
  const pending = count > 0;
  return (
    <Link
      to="/parent/queue"
      className={`flex items-center gap-2 rounded-game border-2 px-2.5 py-2 transition active:scale-[0.99] ${
        pending ? "border-game-coral/60 bg-game-coral/10" : "border-outline/25 bg-white/80"
      }`}
    >
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-outline ${
          pending ? "bg-game-coral/25" : "bg-brand-light"
        }`}
      >
        <IconStar size={16} decorative />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-xs font-extrabold text-outline">Antrean penilaian</span>
        <span className="block text-[10px] font-semibold text-outline/75">
          {pending ? `${count} menunggu · ketuk nilai` : "Tidak ada setoran menunggu"}
        </span>
      </span>
      <span
        className={`flex h-7 min-w-7 items-center justify-center rounded-full border-2 border-outline px-1.5 text-xs font-extrabold ${
          pending ? "bg-game-coral text-white" : "bg-game-locked/80 text-outline/70"
        }`}
      >
        {count}
      </span>
    </Link>
  );
}

function DashboardBody({ onCollapse }: { onCollapse: () => void }) {
  const { data, isLoading } = useQuery({
    queryKey: ["parent-dashboard"],
    queryFn: () => api<Dashboard>("/parent/dashboard"),
    staleTime: 30_000,
  });

  if (isLoading || !data) {
    return <p className="text-xs font-semibold text-outline/80">Memuat dashboard…</p>;
  }

  return (
    <div className="space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-brand">Dashboard keluarga</p>
          <p className="text-sm font-extrabold leading-tight text-outline">{data.family_name}</p>
          <p className="font-mono text-[10px] tracking-wide text-outline/75">
            Kode anak: {formatFamilyCodeDisplay(data.family_access_code)}
          </p>
        </div>
        <button
          type="button"
          onClick={onCollapse}
          className="shrink-0 rounded-pill border-2 border-outline/40 bg-white px-2 py-0.5 text-[10px] font-extrabold text-outline"
        >
          Tutup ▲
        </button>
      </div>

      {!data.children.length ? (
        <p className="text-xs font-semibold text-outline/85">Belum ada profil anak.</p>
      ) : (
        <ul className="space-y-1.5">
          {data.children.map((c) => (
            <li
              key={c.id}
              className="flex items-center gap-2 rounded-game border border-outline/15 bg-brand-light/25 px-2 py-1.5"
            >
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-outline text-xs font-bold text-white"
                style={{ backgroundColor: c.color }}
              >
                {c.name.charAt(0)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-extrabold text-outline">{c.name}</p>
                <div className="mt-0.5 flex flex-wrap items-center gap-1">
                  <StatusBadge kind="tahsin" code={c.tahsin_status} size="sm" compact />
                  <span className="text-[10px] font-semibold text-outline/70">{c.xp} XP</span>
                  {c.pending_setor > 0 && (
                    <span className="text-[10px] font-bold text-game-coral">{c.pending_setor} setoran</span>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap gap-3 pt-0.5 text-[10px] font-bold">
        <Link to="/parent" className="text-brand underline">
          Dashboard lengkap
        </Link>
        <Link to="/pilih-profil" className="text-outline/75 underline">
          Kelola profil
        </Link>
      </div>
    </div>
  );
}

export function HomeParentHeader({
  name,
  memberId,
  memberName,
  dashOpen,
  onOpenDash,
  onCloseDash,
  queueTotal,
}: Props) {
  const subtitle = memberId && memberName
    ? `Progress ${memberName}`
    : "Modul belajar terbuka";

  return (
    <GameCard className="mb-2.5 space-y-2.5 p-2.5 sm:p-3">
      <div className="space-y-2">
        <h1 className="game-text-stroke text-lg font-extrabold leading-none">Halo, {name}</h1>
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className={`rounded-pill border-2 px-1.5 py-px text-[9px] font-extrabold uppercase tracking-wide text-outline ${modeBadgeClass.adult}`}
          >
            Orang tua
          </span>
          <span className="rounded-pill border-2 border-outline/25 bg-white/80 px-2 py-0.5 text-[10px] font-bold text-outline/85">
            {subtitle}
          </span>
        </div>
      </div>

      {dashOpen ? (
        <>
          <QueueRow count={queueTotal} />
          <div className="border-t border-outline/10 pt-2">
            <DashboardBody onCollapse={onCloseDash} />
          </div>
        </>
      ) : (
        <button
          type="button"
          onClick={onOpenDash}
          className="w-full rounded-game border-2 border-dashed border-outline/35 bg-brand-light/30 py-2 text-xs font-bold text-brand"
        >
          Tampilkan dashboard keluarga
        </button>
      )}
    </GameCard>
  );
}
