import { IconCheck, IconLock } from "../icons/GameIcons";

export type MenuTone = "green" | "blue" | "orange" | "teal" | "gold" | "purple" | "red" | "grey";

const TONES: Record<MenuTone, { top: string; bottom: string; lip: string }> = {
  green: { top: "#8CF07A", bottom: "#2FBF71", lip: "#1E8A52" },
  blue: { top: "#6FC8FF", bottom: "#2D8CFF", lip: "#1C5FBF" },
  orange: { top: "#FFC15A", bottom: "#FF8A1F", lip: "#C25E0B" },
  teal: { top: "#6FE9D4", bottom: "#17AFA0", lip: "#0F7C72" },
  gold: { top: "#FFE680", bottom: "#FFB800", lip: "#C98A00" },
  purple: { top: "#C6A4FF", bottom: "#8A5CE6", lip: "#5E36B0" },
  red: { top: "#FF9AA8", bottom: "#FF4D6D", lip: "#BF2E4B" },
  grey: { top: "#D5D9E3", bottom: "#A9AFC0", lip: "#7A8096" },
};

export function CircleMenuButton({
  label,
  sublabel,
  icon,
  tone = "green",
  locked,
  badge,
  onClick,
}: {
  label: string;
  sublabel?: string;
  icon: React.ReactNode;
  tone?: MenuTone;
  locked?: boolean;
  badge?: "check" | "lock";
  onClick: () => void;
}) {
  const t = TONES[locked ? "grey" : tone];

  return (
    <button
      type="button"
      className="group flex flex-col items-center gap-1.5 focus-visible:outline focus-visible:outline-4 focus-visible:outline-white"
      onClick={onClick}
      aria-label={locked ? `${label} (terkunci)` : label}
    >
      <span
        className="relative flex h-[68px] w-[68px] items-center justify-center rounded-full border-[3.5px] border-line transition-transform group-active:translate-y-[3px]"
        style={{
          background: `linear-gradient(180deg, ${t.top}, ${t.bottom})`,
          boxShadow: `0 5px 0 ${t.lip}, 0 5px 0 3.5px #2B1B5E`,
        }}
      >
        <span className="pointer-events-none absolute left-2.5 top-1.5 h-2.5 w-5 -rotate-[20deg] rounded-full bg-white/60" aria-hidden />
        <span className={`relative ${locked ? "opacity-70" : ""} [&_svg]:drop-shadow-none`}>{icon}</span>
        {badge === "check" && (
          <span className="absolute -right-1.5 -top-1.5">
            <IconCheck size={22} decorative />
          </span>
        )}
        {badge === "lock" && (
          <span className="absolute -right-1.5 -top-1.5">
            <IconLock size={22} decorative />
          </span>
        )}
      </span>
      <span className="max-w-[92px] text-center text-xs font-extrabold leading-tight text-white game-text-stroke">{label}</span>
      {sublabel && <span className="-mt-1 text-[9px] font-extrabold uppercase tracking-wide text-outline">{sublabel}</span>}
    </button>
  );
}
