import { NavStar } from "./icons/NavIcons";

export type Progress = { xp: number; level: number; rank_title: string; streak_days: number; xp_level_start: number; xp_next_level: number };

/** Level, kemajuan XP di dalam level ini, dan sisa XP menuju level berikutnya. */
export function LevelCard({ g }: { g: Progress }) {
  const span = Math.max(1, g.xp_next_level - g.xp_level_start);
  const pct = Math.min(100, Math.max(0, ((g.xp - g.xp_level_start) / span) * 100));
  const left = Math.max(0, g.xp_next_level - g.xp);
  return (
    <section className="rounded-[28px] bg-brand p-4 text-white" aria-label="Level">
      <div className="flex items-center gap-3">
        <span className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-full border-4 border-white/70 bg-teal leading-none" aria-label={`Level ${g.level}`}>
          <span className="text-[10px] font-extrabold uppercase tracking-wide opacity-90">Level</span>
          <span className="text-2xl font-extrabold">{g.level}</span>
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-extrabold">{g.rank_title}</p>
          <p className="flex items-center gap-1 text-sm font-bold opacity-95"><NavStar size={18} className="text-gold" />{g.xp} XP{g.streak_days > 0 ? ` · 🔥 ${g.streak_days} hari` : ""}</p>
        </div>
      </div>
      <div className="mt-3 h-4 overflow-hidden rounded-pill bg-white/25" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100} aria-label="Kemajuan menuju level berikutnya">
        <div className="h-full rounded-pill bg-gold transition-[width] duration-500" style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-1.5 text-sm font-bold">{left} XP lagi menuju Level {g.level + 1}</p>
    </section>
  );
}
