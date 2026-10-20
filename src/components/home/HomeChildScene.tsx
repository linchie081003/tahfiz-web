import { useNavigate } from "react-router-dom";
import type { AgeMode } from "../../context/AgeModeContext";
import type { HomeData } from "../../lib/api";
import { Mascot } from "../game/Mascot";
import { IconPearl, IconStreak } from "../icons/GameIcons";

const ACTION_PATH: Record<string, string> = { tahsin: "/tahsin", ziyadah: "/ziyadah", murojaah: "/murojaah", home: "/" };

function Pill({ icon, value, label }: { icon: React.ReactNode; value: string | number; label: string }) {
  return (
    <div
      className="flex h-9 items-center gap-1.5 rounded-pill border-[3px] border-outline bg-white px-3 shadow-game-sm"
      aria-label={`${label}: ${value}`}
    >
      {icon}
      <span className="text-sm font-extrabold text-outline">{value}</span>
    </div>
  );
}

/** HUD + maskot + gelembung misi, sesuai desain "Home gaya game 2D". */
export function HomeChildScene({ home, ageMode }: { home: HomeData; ageMode: AgeMode }) {
  const pct = Math.min(100, Math.max(0, home.level_progress * 100));
  const bubbleTitle = ageMode === "paud" ? `Halo, ${home.greeting_name}!` : home.mission_title;

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <div className="flex min-w-0 flex-1 items-center">
          <span
            className="z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-[3.5px] border-outline bg-gradient-to-b from-game-gold-start to-game-gold-end text-lg font-extrabold text-outline shadow-game-sm"
            aria-label={`Level ${home.level}`}
          >
            {home.level}
          </span>
          <div className="relative -ml-3 h-6 min-w-0 flex-1 overflow-hidden rounded-pill border-[3px] border-outline bg-white">
            <div className="h-full bg-gradient-to-r from-game-green-start to-game-green-end" style={{ width: `${pct}%` }} />
            <span className="absolute inset-0 flex items-center justify-center text-[11px] font-extrabold text-outline">
              {home.xp} / {home.xp_next_level}
            </span>
          </div>
        </div>
        <Pill icon={<IconStreak size={18} decorative />} value={home.streak_days} label="Streak" />
        <Pill icon={<IconPearl size={18} decorative />} value={home.xp} label="XP" />
      </div>

      <div className="flex items-center gap-1 pt-1">
        <Mascot mood={home.mission_xp > 0 ? "excited" : "default"} size={120} className="shrink-0" />
        <div className="relative min-w-0 flex-1 rounded-card border-[3.5px] border-outline bg-white px-3 py-2 shadow-game">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-brand">{bubbleTitle}</p>
          <p className="text-base font-extrabold leading-snug text-outline">{home.mission_detail}</p>
          <span
            className="absolute -left-[9px] top-6 h-4 w-4 rotate-45 border-b-[3.5px] border-l-[3.5px] border-outline bg-white"
            aria-hidden
          />
        </div>
      </div>
    </div>
  );
}

export function HomeMissionCta({ home }: { home: HomeData }) {
  const nav = useNavigate();
  if (home.mission_xp <= 0) return null;
  return (
    <div className="sticky bottom-[92px] z-10 px-1 pt-2">
      <button
        type="button"
        onClick={() => nav(ACTION_PATH[home.mission_action] ?? "/")}
        className="flex min-h-[64px] w-full items-center justify-center gap-2 rounded-pill border-[4px] border-outline bg-gradient-to-b from-game-green-start to-game-green-end text-xl font-extrabold uppercase text-white shadow-[0_6px_0_#2B1B5E] transition-transform active:translate-y-[3px] active:shadow-[0_2px_0_#2B1B5E] game-text-stroke"
      >
        <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
          <path d="M8 5l11 7-11 7z" fill="#fff" stroke="#2B1B5E" strokeWidth="2.5" strokeLinejoin="round" />
        </svg>
        Mulai +{home.mission_xp} XP
      </button>
    </div>
  );
}
