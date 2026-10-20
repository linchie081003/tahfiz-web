import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { GameButton } from "../components/game/GameButton";
import { GameCard } from "../components/game/GameCard";
import { StatusBadge } from "../components/game/StatusBadge";
import { GameHeader } from "../components/game/GameHeader";
import { IconPearl, IconStreak } from "../components/icons/GameIcons";
import { formatFamilyCodeDisplay } from "../lib/familyCode";
import { api, setToken } from "../lib/api";
import { AppPage } from "../components/layout/AppPage";

type ChildSummary = {
  id: string;
  name: string;
  color: string;
  age_mode: string;
  tahsin_status: string;
  xp: number;
  streak_days: number;
  level: number;
  passed_surahs: number;
  pending_setor: number;
};

type Dashboard = {
  family_name: string;
  family_access_code: string;
  queue_total: number;
  active_member_id: string | null;
  children: ChildSummary[];
};

export function ParentDashboardPage() {
  const nav = useNavigate();
  const qc = useQueryClient();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["parent-dashboard"],
    queryFn: () => api<Dashboard>("/parent/dashboard"),
    retry: false,
  });

  const openAsChild = async (memberId: string) => {
    const t = await api<{ access_token: string }>(`/members/${memberId}/impersonate`, { method: "POST" });
    setToken(t.access_token);
    await qc.invalidateQueries({ queryKey: ["session"] });
    await qc.invalidateQueries({ queryKey: ["home"] });
    nav("/", { replace: true });
  };

  const exitChildView = async () => {
    const t = await api<{ access_token: string }>("/members/exit-impersonate", { method: "POST" });
    setToken(t.access_token);
    await qc.invalidateQueries({ queryKey: ["session"] });
    await qc.invalidateQueries({ queryKey: ["parent-dashboard"] });
  };

  if (isLoading) {
    return (
      <AppPage>
        <GameHeader title="Dashboard keluarga" to="/" />
        <p className="text-center font-bold text-outline">Memuat dashboard…</p>
      </AppPage>
    );
  }
  if (isError || !data) {
    return (
      <AppPage>
        <GameHeader title="Dashboard keluarga" to="/" />
        <p className="font-bold text-outline">Dashboard hanya untuk akun orang tua.</p>
      </AppPage>
    );
  }

  return (
    <AppPage className="pb-10">
      <GameHeader
        title="Dashboard keluarga"
        to="/"
        right={
          data.active_member_id ? (
            <button
              type="button"
              onClick={() => void exitChildView()}
              className="max-w-[7rem] text-right text-[10px] font-bold leading-tight text-brand underline"
            >
              Keluar mode anak
            </button>
          ) : undefined
        }
      />
      <p className="-mt-2 text-center text-sm font-semibold text-outline/90">{data.family_name}</p>

      <GameCard className="space-y-2">
        <p className="text-sm font-bold text-outline">Kode login anak</p>
        <p className="font-mono text-2xl tracking-[0.3em] text-outline">{formatFamilyCodeDisplay(data.family_access_code)}</p>
        <div className="flex flex-wrap gap-2 pt-1">
          <Link
            to="/parent/queue"
            className="rounded-pill border-2 border-outline bg-brand-light px-3 py-1 text-xs font-bold text-outline"
          >
            Antrean penilaian
            {data.queue_total > 0 ? ` (${data.queue_total})` : ""}
          </Link>
          <Link to="/parent/laporan" className="rounded-pill border-2 border-outline px-3 py-1 text-xs font-bold text-outline">
            Laporan mingguan
          </Link>
          <Link to="/pilih-profil" className="rounded-pill border-2 border-outline px-3 py-1 text-xs font-bold text-outline">
            Kelola profil
          </Link>
          <Link to="/settings" className="rounded-pill border-2 border-outline px-3 py-1 text-xs font-bold text-outline">
            Pengaturan
          </Link>
        </div>
      </GameCard>

      {!data.children.length && (
        <GameCard>
          <p className="text-sm font-semibold text-outline">Belum ada profil anak. Tambahkan di halaman kelola profil.</p>
          <GameButton className="mt-3" size="md" onClick={() => nav("/pilih-profil")}>
            Tambah profil anak
          </GameButton>
        </GameCard>
      )}

      <div className="space-y-3">
        {data.children.map((c) => (
          <GameCard key={c.id} className="space-y-3">
            <div className="flex items-center gap-3">
              <span
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-outline text-xl font-extrabold text-white"
                style={{ backgroundColor: c.color }}
              >
                {c.name.charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-lg font-extrabold text-outline">
                  {c.name}
                  {data.active_member_id === c.id ? " · sedang dibuka" : ""}
                </p>
                <p className="text-xs font-semibold capitalize text-outline/80">Mode {c.age_mode.replace("_", " ")}</p>
              </div>
            </div>
            <StatusBadge kind="tahsin" code={c.tahsin_status} size="md" />
            <div className="flex flex-wrap gap-2 text-xs font-bold text-outline">
              <span className="inline-flex items-center gap-1 rounded-pill bg-brand-light px-2 py-1">
                <IconPearl size={16} decorative /> {c.xp} XP · Lv {c.level}
              </span>
              <span className="inline-flex items-center gap-1 rounded-pill bg-brand-light px-2 py-1">
                <IconStreak size={16} decorative /> {c.streak_days} hari
              </span>
              <span className="rounded-pill bg-brand-light px-2 py-1">{c.passed_surahs} surat lulus</span>
              {c.pending_setor > 0 && (
                <span className="rounded-pill bg-game-coral/30 px-2 py-1">{c.pending_setor} setoran menunggu</span>
              )}
            </div>
            <GameButton size="md" onClick={() => void openAsChild(c.id)}>
              Buka Home {c.name}
            </GameButton>
          </GameCard>
        ))}
      </div>

    </AppPage>
  );
}
