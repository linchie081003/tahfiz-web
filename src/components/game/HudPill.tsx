export function HudPill({
  icon,
  value,
  label,
  compact,
}: {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  compact?: boolean;
}) {
  return (
    <div
      className={`flex items-center rounded-pill border-2 border-outline/80 bg-white/95 shadow-game-sm ${
        compact ? "gap-0.5 px-1.5 py-0.5" : "gap-1 px-2 py-1"
      }`}
      aria-label={`${label}: ${value}`}
      title={label}
    >
      {icon}
      <span className={`font-extrabold text-outline ${compact ? "text-xs" : "text-sm"}`}>{value}</span>
    </div>
  );
}
