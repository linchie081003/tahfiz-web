import type { AgeMode } from "../../context/AgeModeContext";
import type { HomeData } from "../../lib/api";
import {
  formatRankTitle,
  homeGreeting,
  modeBadgeClass,
  modeBadgeLabel,
  rankEmoji,
} from "../../lib/rankDisplay";
import { MissionCardContent } from "../MissionCardContent";
import { GameCard } from "../game/GameCard";
import { HudPill } from "../game/HudPill";
import { XpBar } from "../game/XpBar";
import { IconPearl, IconStreak } from "../icons/GameIcons";

type Props = {
  name: string;
  rankTitle: string;
  level: number;
  streakDays: number;
  xp: number;
  xpNext: number;
  levelProgress: number;
  ageMode: AgeMode;
  home: HomeData;
};

export function HomePlayerHeader({
  name,
  rankTitle,
  level,
  streakDays,
  xp,
  xpNext,
  levelProgress,
  ageMode,
  home,
}: Props) {
  const greeting = homeGreeting(name, ageMode);
  const rank = formatRankTitle(rankTitle, level, ageMode);
  const emoji = rankEmoji(level, ageMode);
  const titleSize =
    ageMode === "paud" ? "text-xl" : ageMode === "sd" ? "text-lg" : "text-base sm:text-lg";

  return (
    <GameCard className="mb-2.5 space-y-2.5 p-2.5 sm:p-3">
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <h1 className={`game-text-stroke min-w-0 flex-1 font-extrabold leading-none ${titleSize}`}>{greeting}</h1>
          <div className="flex shrink-0 items-center gap-1">
            <HudPill icon={<IconStreak size={14} decorative />} value={streakDays} label="Streak" compact />
            <HudPill icon={<IconPearl size={14} decorative />} value={xp} label="XP" compact />
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span
            className={`shrink-0 rounded-pill border-2 px-1.5 py-px text-[9px] font-extrabold uppercase tracking-wide text-outline ${modeBadgeClass[ageMode]}`}
          >
            {modeBadgeLabel(ageMode)}
          </span>
          <div className="home-rank-badge flex min-w-0 flex-1 items-center gap-1.5 rounded-pill border-2 border-outline/35 bg-brand-light/35 px-2 py-1">
            <span className="text-base leading-none" aria-hidden>
              {emoji}
            </span>
            <p className="min-w-0 truncate text-xs font-extrabold text-outline">
              {rank}
              <span className="font-bold text-brand"> · Lv {level}</span>
            </p>
          </div>
        </div>

        <XpBar level={level} progress={levelProgress} xp={xp} xpNext={xpNext} compact />
      </div>

      <div className="border-t border-outline/10 pt-2">
        <MissionCardContent home={home} compact />
      </div>
    </GameCard>
  );
}
