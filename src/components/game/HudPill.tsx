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
      className={`flex items-center rounded-pill bg-gold ${compact ? "gap-1 px-2 py-0.5" : "gap-1.5 px-3 py-1"}`}
      aria-label={`${label}: ${value}`}
      title={label}
    >
      {icon}
      <span className={`font-extrabold text-gold-ink ${compact ? "text-xs" : "text-sm"}`}>{value}</span>
    </div>
  );
}
