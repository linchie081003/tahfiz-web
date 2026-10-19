import type { HomeData } from "../lib/api";
import { GameCard } from "./game/GameCard";
import { MissionCardContent } from "./MissionCardContent";

export function MissionCard({ home }: { home: HomeData }) {
  return (
    <GameCard className="mx-3 mb-6 mt-2">
      <MissionCardContent home={home} />
    </GameCard>
  );
}
