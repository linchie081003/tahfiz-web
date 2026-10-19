import { useAgeMode } from "../../context/AgeModeContext";

type Variant = "primary" | "gold" | "danger" | "locked";
type Size = "lg" | "md" | "sm";

const variants: Record<Variant, string> = {
  primary: "bg-gradient-to-b from-game-green-start to-game-green-end text-white",
  gold: "bg-gradient-to-b from-game-gold-start to-game-gold-end text-outline",
  danger: "bg-gradient-to-b from-game-coral to-[#e85a40] text-white",
  locked: "bg-game-locked text-outline/60 cursor-not-allowed",
};

export function GameButton({
  children,
  variant = "primary",
  size = "lg",
  className = "",
  disabled,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  const { isCalm } = useAgeMode();
  const h = size === "lg" ? "min-h-[56px]" : size === "md" ? "min-h-[44px]" : "min-h-[36px]";
  const text = size === "lg" ? "text-base" : size === "md" ? "text-sm" : "text-xs";
  const locked = variant === "locked" || disabled;
  const shadow = isCalm ? "shadow-game-sm active:shadow-game-press" : "shadow-game active:shadow-game-press";

  return (
    <button
      type="button"
      disabled={locked}
      className={`game-btn-shadow w-full rounded-pill border-[3px] border-outline font-extrabold uppercase tracking-wide ${h} ${text} ${variants[variant]} ${shadow} transition-transform active:translate-y-[3px] focus-visible:outline focus-visible:outline-4 focus-visible:outline-brand-light ${className}`}
      {...rest}
    >
      <span className={variant === "gold" ? "game-text-stroke" : ""}>{children}</span>
    </button>
  );
}
