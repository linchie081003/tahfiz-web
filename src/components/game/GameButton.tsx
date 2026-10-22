type Variant = "primary" | "gold" | "danger" | "locked" | "outline";
type Size = "lg" | "md" | "sm";

const variants: Record<Variant, string> = {
  primary: "bg-brand text-white active:bg-brand-dark",
  gold: "bg-gold text-gold-ink",
  danger: "bg-coral text-white",
  outline: "border-[3px] border-brand bg-white text-brand-dark",
  locked: "bg-lav text-muted cursor-not-allowed",
};

export function GameButton({
  children,
  variant = "primary",
  size = "lg",
  className = "",
  disabled,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  const h = size === "lg" ? "min-h-[56px]" : size === "md" ? "min-h-[48px]" : "min-h-[44px]";
  const text = size === "lg" ? "text-lg" : "text-base";
  const locked = variant === "locked" || disabled;
  return (
    <button
      type="button"
      disabled={locked}
      className={`flex w-full items-center justify-center gap-2 rounded-pill font-extrabold ${h} ${text} ${
        locked && variant !== "locked" ? variants.locked : variants[variant]
      } ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
