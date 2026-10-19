import { GameCard } from "./game/GameCard";
import { IconStar } from "./icons/GameIcons";
import { QuranAudioPlayer } from "./QuranAudioPlayer";
import { useState } from "react";
import { isBeautyRewardSeen, markBeautyRewardSeen } from "../lib/reciterPolicy";
import type { HomeData } from "../lib/api";

type Reward = NonNullable<HomeData["beauty_reward"]>;

export function BeautyRewardCard({ reward }: { reward: Reward }) {
  const [hidden, setHidden] = useState(() => isBeautyRewardSeen(reward.submission_id));
  if (hidden) return null;

  const dismiss = () => {
    markBeautyRewardSeen(reward.submission_id);
    setHidden(true);
  };

  return (
    <GameCard className="mx-3 mb-3 space-y-2 border-2 border-game-gold bg-gradient-to-br from-brand-light to-white">
      <div className="flex items-center gap-2">
        <IconStar size={28} decorative />
        <p className="font-extrabold text-outline">Hadiah hafalan</p>
      </div>
      <p className="text-sm font-semibold text-outline/90">
        Ayat {reward.ayah_start}
        {reward.ayah_end > reward.ayah_start ? `–${reward.ayah_end}` : ""} · surat #{reward.surah_id}
      </p>
      <QuranAudioPlayer sources={reward.audio_urls} label={reward.label} tone="light" />
      <button type="button" onClick={dismiss} className="text-xs font-bold text-outline underline">
        Selesai mendengarkan
      </button>
    </GameCard>
  );
}
