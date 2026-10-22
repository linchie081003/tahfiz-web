import { IconDelete } from "../icons/GameIcons";

const KEYS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".split("");
const LEN = 8;

export function AccessCodeInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const chars = value.toUpperCase().padEnd(LEN, " ").slice(0, LEN).split("");

  const push = (k: string) => {
    const cur = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (cur.length >= LEN) return;
    onChange(cur + k);
  };

  const back = () => onChange(value.slice(0, -1));

  return (
    <div className="space-y-4">
      <div className="flex justify-center gap-1.5" aria-label="Kode keluarga">
        {chars.map((c, i) => (
          <div
            key={i}
            className="flex h-11 w-9 items-center justify-center rounded-game border-2 border-line bg-white text-lg font-extrabold text-outline shadow-game-sm sm:h-12 sm:w-10"
          >
            {c.trim() || ""}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-6 gap-2">
        {KEYS.map((k) => (
          <button
            key={k}
            type="button"
            className="min-h-[44px] rounded-game border-2 border-line bg-white text-sm font-extrabold text-outline shadow-game-sm active:translate-y-0.5 active:shadow-game-press"
            onClick={() => push(k)}
          >
            {k}
          </button>
        ))}
        <button
          type="button"
          className="col-span-2 flex min-h-[44px] items-center justify-center rounded-game border-2 border-line bg-game-locked shadow-game-sm"
          onClick={back}
          aria-label="Hapus satu"
        >
          <IconDelete size={28} />
        </button>
        <button
          type="button"
          disabled={!value.length}
          className="col-span-4 min-h-[44px] rounded-game border-2 border-line bg-brand-light/80 text-xs font-extrabold uppercase tracking-wide text-outline shadow-game-sm disabled:opacity-40 active:translate-y-0.5"
          onClick={() => onChange("")}
          aria-label="Hapus semua"
        >
          Clear
        </button>
      </div>
    </div>
  );
}
