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
  return (
    <div className="flex items-center gap-2">
      <div
        className={`flex shrink-0 items-center justify-center rounded-full bg-teal font-extrabold text-white ${compact ? "h-8 w-8 text-sm" : "h-11 w-11 text-lg"}`}
        aria-label={`Level ${level}`}
      >
        {level}
      </div>
      <div className="min-w-0 flex-1">
        <div className={`overflow-hidden rounded-pill bg-lav ${compact ? "h-2.5" : "h-3.5"}`}>
          <div className="h-full rounded-pill bg-teal transition-[width] duration-300" style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-0.5 text-[11px] font-bold text-muted">
          {xp} / {xpNext} bintang
        </p>
      </div>
    </div>
  );
}
