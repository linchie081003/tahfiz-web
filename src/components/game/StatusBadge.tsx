import { getStatusMeta, statusToneClass, type StatusKind } from "../../lib/statusDisplay";

type Size = "sm" | "md" | "lg";

const sizeClass: Record<Size, string> = {
  sm: "px-2 py-0.5 text-[10px] gap-1",
  md: "px-3 py-1 text-xs gap-1.5",
  lg: "px-4 py-2 text-sm gap-2",
};

export function StatusBadge({
  kind,
  code,
  size = "md",
  compact,
  className = "",
}: {
  kind: StatusKind;
  code: string;
  size?: Size;
  /** Hanya shortLabel + emoji */
  compact?: boolean;
  className?: string;
}) {
  const meta = getStatusMeta(kind, code);
  const text = compact ? meta.shortLabel : meta.label;
  const title = compact ? meta.label : undefined;

  return (
    <span
      title={title}
      className={`inline-flex max-w-full items-center rounded-pill border-2 font-extrabold leading-tight ${sizeClass[size]} ${statusToneClass[meta.tone]} ${className}`}
    >
      <span aria-hidden className="shrink-0">
        {meta.emoji}
      </span>
      <span className="truncate">{text}</span>
    </span>
  );
}

/** Kartu status besar (mis. halaman Tahsin). */
export function StatusCard({ kind, code, hint }: { kind: StatusKind; code: string; hint?: string }) {
  const meta = getStatusMeta(kind, code);

  return (
    <div className={`rounded-card border-[3px] p-4 shadow-game-sm ${statusToneClass[meta.tone]}`}>
      <p className="text-[10px] font-extrabold uppercase tracking-wide text-outline/70">Status kamu</p>
      <p className="mt-1 flex items-center gap-2 text-lg font-extrabold text-outline">
        <span aria-hidden>{meta.emoji}</span>
        {meta.label}
      </p>
      {hint && <p className="mt-2 text-sm font-semibold text-outline/85">{hint}</p>}
    </div>
  );
}
