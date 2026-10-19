import { useAgeMode } from "../../context/AgeModeContext";

export function GameScene({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const { ageClass } = useAgeMode();
  return <div className={`game-scene ${ageClass} ${className}`}>{children}</div>;
}
