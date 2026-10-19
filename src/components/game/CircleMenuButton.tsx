import { IconCheck, IconLock } from "../icons/GameIcons";
import { useAgeMode } from "../../context/AgeModeContext";

export function CircleMenuButton({
  label,
  icon,
  locked,
  badge,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  locked?: boolean;
  badge?: "check" | "lock";
  onClick: () => void;
}) {
  const { mode } = useAgeMode();
  const size = mode === "paud" || mode === "sd" ? "h-[64px] w-[64px]" : "h-[56px] w-[56px]";

  return (
    <button type="button" className="group flex flex-col items-center gap-1 focus-visible:outline focus-visible:outline-4 focus-visible:outline-brand-light" onClick={onClick}>
      <div
        className={`relative flex ${size} items-center justify-center rounded-full border-[3px] border-outline bg-gradient-to-b from-white to-brand-light shadow-game transition-transform group-active:translate-y-1 group-active:shadow-game-press ${locked ? "from-game-locked to-game-locked opacity-90" : ""}`}
      >
        <span className={locked ? "opacity-50 grayscale" : ""}>{icon}</span>
        {badge === "check" && (
          <span className="absolute -right-1 -top-1">
            <IconCheck size={18} decorative />
          </span>
        )}
        {badge === "lock" && (
          <span className="absolute -right-1 -top-1">
            <IconLock size={18} decorative />
          </span>
        )}
      </div>
      <span className="max-w-[88px] text-center text-[11px] font-extrabold leading-tight text-white game-text-stroke sm:text-xs">
        {label}
      </span>
    </button>
  );
}
