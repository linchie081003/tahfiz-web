export function XpBar({
  level,
  progress,
  xp,
  xpNext,
  compact,
}: {
  level: number;
  progress: number;
  xp: number;
  xpNext: number;
  compact?: boolean;
}) {
  const pct = Math.min(100, Math.max(0, progress * 100));
  const badge = compact ? "h-8 w-8 text-xs border-2" : "h-11 w-11 text-sm border-[3px]";
  const barH = compact ? "h-3" : "h-4";

  return (
    <div className="flex items-center gap-2">
      {!compact && (
        <div
          className={`flex shrink-0 items-center justify-center rounded-full border-outline bg-gradient-to-b from-game-gold-start to-game-gold-end font-extrabold text-outline shadow-game-sm ${badge}`}
          aria-label={`Level ${level}`}
        >
          {level}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className={`overflow-hidden rounded-pill border-2 border-outline/80 bg-white shadow-game-sm ${barH}`}>
          <div
            className="h-full rounded-pill bg-gradient-to-r from-game-green-start to-game-green-end transition-[width] duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className={`font-bold text-outline/75 ${compact ? "mt-0.5 text-[9px]" : "mt-1 text-[10px]"}`}>
          {xp} / {xpNext} XP{compact ? ` · Lv ${level}` : ""}
        </p>
      </div>
    </div>
  );
}
