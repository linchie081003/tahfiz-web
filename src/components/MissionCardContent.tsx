import { useNavigate } from "react-router-dom";
import type { HomeData } from "../lib/api";
import { GameButton } from "./game/GameButton";
import { Mascot } from "./game/Mascot";
import { SpeechBubble } from "./game/SpeechBubble";
import { IconPlay } from "./icons/GameIcons";

export function MissionCardContent({ home, compact }: { home: HomeData; compact?: boolean }) {
  const nav = useNavigate();
  const go = () => {
    const map: Record<string, string> = {
      tahsin: "/tahsin",
      ziyadah: "/ziyadah",
      murojaah: "/murojaah",
      home: "/",
    };
    nav(map[home.mission_action] ?? "/");
  };

  const mascotSize = compact ? 52 : 72;
  const btnSize = compact ? "sm" : "md";
  const iconSize = compact ? 14 : 18;

  return (
    <div className={`flex items-start ${compact ? "gap-2" : "gap-3"}`}>
      <Mascot mood={home.mission_xp > 0 ? "excited" : "default"} size={mascotSize} className="shrink-0" />
      <div className="min-w-0 flex-1 space-y-1.5">
        <p className="text-[10px] font-extrabold uppercase tracking-wider text-brand">{home.mission_title}</p>
        <SpeechBubble compact={compact}>{home.mission_detail}</SpeechBubble>
        {home.mission_xp > 0 && (
          <GameButton size={btnSize} onClick={go} className={compact ? "mt-0.5" : ""}>
            <span className="inline-flex items-center justify-center gap-1.5">
              <IconPlay size={iconSize} decorative />
              Mulai +{home.mission_xp} XP
            </span>
          </GameButton>
        )}
      </div>
    </div>
  );
}
