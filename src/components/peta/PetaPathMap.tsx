import { Mascot } from "../game/Mascot";
import { IconCheck, IconLock } from "../icons/GameIcons";
import { PetaSurahIcon, petaNodeAccent } from "./PetaSurahIcons";

const O = "#2B1B5E";

export type PetaMapNode = {
  surah_id: number;
  name_id: string;
  status: string;
};

function nodeY(index: number, total: number) {
  const step = 88;
  return 48 + index * step;
}

function nodeX(index: number) {
  const wave = [48, 152, 72, 128, 56, 144];
  return wave[index % wave.length]!;
}

function buildSmoothPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0]!.x} ${points[0]!.y}`;
  let d = `M ${points[0]!.x} ${points[0]!.y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1]!;
    const curr = points[i]!;
    const cpY = (prev.y + curr.y) / 2;
    d += ` C ${prev.x} ${cpY}, ${curr.x} ${cpY}, ${curr.x} ${curr.y}`;
  }
  return d;
}

type Props = {
  nodes: PetaMapNode[];
  onOpen: (surahId: number) => void;
};

export function PetaPathMap({ nodes, onOpen }: Props) {
  const total = nodes.length;
  const h = Math.max(total * 88 + 120, 420);
  const points = nodes.map((_, i) => ({ x: nodeX(i), y: nodeY(i, total) }));
  const pathD = buildSmoothPath(points);
  const primaryActiveIdx = nodes.findIndex((n) => n.status === "active");

  return (
    <div
      className="relative mx-auto mt-3 max-w-sm overflow-hidden rounded-card border-[4px] border-outline shadow-game"
      style={{ height: h }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-[#9edfff]/90 via-[#d8f4ff]/80 to-[#8be36b]/70" aria-hidden />
      <svg className="absolute bottom-0 w-full" viewBox="0 0 200 40" preserveAspectRatio="none" aria-hidden>
        <path d="M0 40V28c40-8 80 8 120 0s80-8 120 0v12H0z" fill="#5ccb4e" opacity="0.85" />
        <path d="M0 40V32c50 6 100-6 150 2s50 6 50 6v0H0z" fill="#8be36b" />
      </svg>

      {/* awan dekoratif */}
      <div className="pointer-events-none absolute left-3 top-3 h-8 w-14 rounded-full bg-white/70 shadow-sm" aria-hidden />
      <div className="pointer-events-none absolute right-6 top-8 h-6 w-10 rounded-full bg-white/60" aria-hidden />

      <svg className="absolute inset-0 h-full w-full" viewBox={`0 0 200 ${h}`} aria-hidden>
        <path
          d={pathD}
          fill="none"
          stroke="#2B1B5E"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.25"
        />
        <path
          d={pathD}
          fill="none"
          stroke="url(#petaPathGrad)"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="14 10"
        />
        <defs>
          <linearGradient id="petaPathGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#4DB8FF" />
            <stop offset="100%" stopColor="#8CF07A" />
          </linearGradient>
        </defs>
        {points.map((pt, i) => (
          <circle key={i} cx={pt.x} cy={pt.y} r="4" fill="#FFC933" stroke={O} strokeWidth="2" />
        ))}
      </svg>

      {nodes.map((n, i) => {
        const isPassed = n.status === "passed";
        const isActive = n.status === "active";
        const isLocked = n.status === "locked";
        const open = !isLocked;
        const isPrimary = isActive && i === primaryActiveIdx;
        const pt = points[i]!;
        const accent = petaNodeAccent(n.surah_id);

        return (
          <div
            key={n.surah_id}
            className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${(pt.x / 200) * 100}%`, top: pt.y }}
          >
            <button
              type="button"
              disabled={!open}
              className={`group flex flex-col items-center ${isPrimary ? "animate-peta-bounce" : ""}`}
              onClick={() => open && onOpen(n.surah_id)}
            >
              <div className="relative">
                <div
                  className={`flex h-[4.25rem] w-[4.25rem] items-center justify-center rounded-game border-[3px] border-outline bg-gradient-to-br shadow-game transition group-active:scale-95 ${
                    isPassed
                      ? "from-game-green-start to-game-green-end"
                      : isLocked
                        ? "from-game-locked to-white"
                        : accent
                  } ${isPrimary ? "ring-4 ring-brand/40 ring-offset-2" : ""}`}
                >
                  {isPassed ? (
                    <IconCheck size={30} decorative />
                  ) : isLocked ? (
                    <IconLock size={26} decorative />
                  ) : (
                    <PetaSurahIcon surahId={n.surah_id} size={30} />
                  )}
                </div>
                <span className="absolute -right-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full border-2 border-outline bg-white px-1 text-[10px] font-extrabold text-outline">
                  {n.surah_id}
                </span>
                {isPrimary && (
                  <Mascot mood="excited" size={44} className="absolute -right-14 -top-2 hidden sm:block" />
                )}
              </div>
              <p
                className={`mt-1.5 max-w-[108px] text-center text-[10px] font-extrabold leading-tight ${
                  isLocked ? "text-outline/50" : "text-outline"
                }`}
              >
                {isPrimary && <span className="block text-[9px] font-extrabold uppercase text-brand">Misi</span>}
                {n.name_id}
              </p>
            </button>
          </div>
        );
      })}

      <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center opacity-80">
        <div className="flex h-11 w-11 items-center justify-center rounded-game border-[3px] border-outline bg-game-locked shadow-game-sm">
          <IconLock size={22} decorative />
        </div>
        <p className="mt-0.5 text-[9px] font-extrabold text-outline">Ujian Juz</p>
      </div>
    </div>
  );
}
