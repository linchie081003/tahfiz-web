import { surahName } from "../lib/surahInfo";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { useMemo } from "react";
import { GameButton } from "../components/game/GameButton";
import { GameCard } from "../components/game/GameCard";
import { StatusBadge } from "../components/game/StatusBadge";
import { PetaPathMap } from "../components/peta/PetaPathMap";
import { PetaSurahIcon } from "../components/peta/PetaSurahIcons";
import { IconBack } from "../components/icons/GameIcons";
import { api, type PetaData } from "../lib/api";

type SurahRow = { id: number; name_id: string; ayah_count: number; curriculum_order: number };

export function PetaPage() {
  const nav = useNavigate();
  const { data, refetch, isFetching: petaLoading } = useQuery({
    queryKey: ["peta"],
    queryFn: () => api<PetaData>("/peta/juz/30"),
  });
  const surahsJuz30 = useQuery({
    queryKey: ["quran", "surahs", 30],
    queryFn: () => api<SurahRow[]>(`/quran/surahs?juz=30`),
  });

  const reloadAll = () => {
    void refetch();
    void surahsJuz30.refetch();
  };

  const listItems = useMemo(() => {
    if (!data) return [];
    if (data.nodes.length) {
      return [...data.nodes].sort((a, b) => a.curriculum_order - b.curriculum_order);
    }
    const rows = surahsJuz30.data ?? [];
    return rows.map((s) => ({
      surah_id: s.id,
      name_id: s.name_id,
      ayah_count: s.ayah_count,
      status: "active" as const,
      curriculum_order: s.curriculum_order,
    }));
  }, [data, surahsJuz30.data]);

  const listLoading = petaLoading || surahsJuz30.isFetching;

  if (!data) return <div className="p-6 font-bold text-outline">Memuat perjalanan…</div>;

  const mapNodes = data.nodes.length ? data.nodes : listItems;

  return (
    <div className="min-h-dvh px-4 pb-28 pt-1">
      <div className="flex min-h-10 items-center gap-2">
        <Link to="/" className="rounded-full border-2 border-line bg-white p-2 shadow-game-sm" aria-label="Kembali">
          <IconBack size={24} decorative />
        </Link>
        <div>
          <h1 className="game-text-stroke text-lg font-extrabold leading-tight sm:text-xl">Perjalanan Juz Amma</h1>
          <p className="text-xs font-bold text-outline/90">Juz 30 · jalur hafalan</p>
        </div>
      </div>

      <GameCard className="mx-3 mt-2 space-y-2 py-3 text-center">
        <p className="text-sm font-extrabold text-outline">
          {data.passed_count} / {Math.max(data.total_count, listItems.length)} surat sudah hafal
        </p>
        <div className="flex flex-wrap justify-center gap-1.5 px-2">
          <StatusBadge kind="journey" code="passed" size="sm" compact />
          <StatusBadge kind="journey" code="active" size="sm" compact />
          <StatusBadge kind="journey" code="locked" size="sm" compact />
        </div>
      </GameCard>

      <PetaPathMap nodes={mapNodes} onOpen={(id) => nav(`/quran/${id}`)} />

      {data.unlock_hint && (
        <GameCard className="mx-3 mt-4 text-center text-sm font-semibold text-outline">{data.unlock_hint}</GameCard>
      )}

      <section className="mx-3 mt-4 pb-4">
        <h2 className="mb-2 text-sm font-extrabold text-outline">Daftar surat Juz 30</h2>
        {listLoading && listItems.length === 0 && (
          <p className="text-sm font-semibold text-outline/80">Memuat daftar surat…</p>
        )}
        {listItems.length === 0 && !listLoading && (
          <GameCard className="space-y-2 p-4 text-center text-sm text-outline">
            <p>
              Katalog surat belum ada di database. Backend perlu internet sekali untuk muat 114 surat dari Quran.com,
              atau jalankan <code className="rounded bg-black/5 px-1">python scripts/seed_quran.py</code>.
            </p>
            <GameButton onClick={reloadAll}>Muat ulang</GameButton>
          </GameCard>
        )}
        <ul className="space-y-2">
          {listItems.map((n) => {
            const locked = n.status === "locked";
            return (
              <li key={n.surah_id}>
                {locked ? (
                  <div className="flex items-center gap-3 rounded-card border-2 border-line bg-white/60 px-4 py-3 opacity-90">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-game border-2 border-line bg-game-locked/50">
                      <PetaSurahIcon surahId={n.surah_id} size={22} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-outline">{surahName(n.surah_id, n.name_id)}</p>
                      <p className="text-xs text-outline/70">{n.ayah_count} ayat</p>
                    </div>
                    <StatusBadge kind="journey" code="locked" size="sm" compact />
                  </div>
                ) : (
                  <button
                    type="button"
                    className="flex w-full items-center gap-3 rounded-card border-2 border-line bg-white px-4 py-3 text-left shadow-game-sm active:translate-y-0.5"
                    onClick={() => nav(`/quran/${n.surah_id}`)}
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-game border-2 border-line bg-white shadow-game-sm">
                      <PetaSurahIcon surahId={n.surah_id} size={24} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-extrabold text-outline">{surahName(n.surah_id, n.name_id)}</p>
                      <p className="text-xs text-outline/75">{n.ayah_count} ayat</p>
                    </div>
                    <StatusBadge kind="journey" code={n.status} size="sm" compact />
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      {data.active_surah_name && (
        <div className="fixed bottom-0 left-1/2 w-full max-w-game -translate-x-1/2 p-4">
          <GameButton onClick={() => nav("/ziyadah")}>Lanjut: {data.active_surah_name}</GameButton>
        </div>
      )}
    </div>
  );
}
