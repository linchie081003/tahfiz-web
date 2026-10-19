import { IconDelete } from "../icons/GameIcons";

type Props = {
  value: string;
  onChange: (v: string) => void;
  maxLength?: number;
  mask?: boolean;
  slotLabel?: string;
  /** Tombol hapus semua digit (default: tampil) */
  showClear?: boolean;
};

export function NumericPinPad({
  value,
  onChange,
  maxLength = 6,
  mask = false,
  slotLabel,
  showClear = true,
}: Props) {
  const push = (d: string) => {
    if (value.length >= maxLength) return;
    onChange(value + d);
  };

  const back = () => onChange(value.slice(0, -1));

  const slots = Array.from({ length: maxLength }, (_, i) => value[i] ?? "");
  const rows = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
  ] as const;

  return (
    <div className="space-y-4">
      {slotLabel && <p className="text-center text-sm font-semibold text-outline">{slotLabel}</p>}
      <div className="flex justify-center gap-2" aria-label={slotLabel ?? "PIN"}>
        {slots.map((c, i) => (
          <div
            key={i}
            className="flex h-14 w-11 items-center justify-center rounded-game border-[3px] border-outline bg-white text-2xl font-extrabold text-outline shadow-game-sm sm:h-16 sm:w-12"
          >
            {c ? (mask ? "•" : c) : ""}
          </div>
        ))}
      </div>
      <div className="mx-auto grid max-w-xs grid-cols-3 gap-3">
        {rows.flat().map((d) => (
          <button
            key={d}
            type="button"
            className="min-h-[56px] rounded-game border-[3px] border-outline bg-white text-xl font-extrabold text-outline shadow-game-sm active:translate-y-0.5"
            onClick={() => push(d)}
          >
            {d}
          </button>
        ))}
        <button
          type="button"
          className="flex min-h-[56px] items-center justify-center rounded-game border-[3px] border-outline bg-game-locked shadow-game-sm"
          onClick={back}
          aria-label="Hapus"
        >
          <IconDelete size={28} />
        </button>
        <button
          type="button"
          className="min-h-[56px] rounded-game border-[3px] border-outline bg-white text-xl font-extrabold text-outline shadow-game-sm active:translate-y-0.5"
          onClick={() => push("0")}
        >
          0
        </button>
        {showClear ? (
          <button
            type="button"
            disabled={value.length === 0}
            className="min-h-[56px] rounded-game border-[3px] border-outline bg-brand-light/80 text-xs font-extrabold uppercase tracking-wide text-outline shadow-game-sm disabled:opacity-40 active:translate-y-0.5"
            onClick={() => onChange("")}
            aria-label="Hapus semua"
          >
            Clear
          </button>
        ) : (
          <div aria-hidden className="min-h-[56px]" />
        )}
      </div>
    </div>
  );
}
