import type { ButtonHTMLAttributes, ReactNode } from "react";
import { useNavigate } from "react-router-dom";

/** Kepala layar: panah kembali, label kecil, judul besar, chip opsional. */
export function ScreenHead({ eyebrow, title, sub, back = true, to, right }: {
  eyebrow?: string; title: string; sub?: string; back?: boolean; to?: string; right?: ReactNode;
}) {
  const nav = useNavigate();
  return (
    <header className="flex items-start gap-1">
      {back && (
        <button type="button" aria-label="Kembali" onClick={() => (to ? nav(to) : nav(-1))} className="-ml-2 flex h-11 w-11 shrink-0 items-center justify-center text-brand">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg>
        </button>
      )}
      <div className="min-w-0 flex-1 pt-0.5">
        {eyebrow && <p className="text-sm font-semibold text-muted">{eyebrow}</p>}
        <h1 className="text-[26px] font-extrabold leading-tight text-outline">{title}</h1>
        {sub && <p className="text-sm font-semibold text-muted">{sub}</p>}
      </div>
      {right && <div className="shrink-0 pt-1">{right}</div>}
    </header>
  );
}

type Tone = "lav" | "cream" | "mint" | "plain" | "teal" | "brand";
const TONES: Record<Tone, string> = {
  lav: "bg-brand-light", cream: "bg-cream border-2 border-gold", mint: "bg-[#E4F3F0]", plain: "bg-white border-2 border-line",
  teal: "bg-teal text-white", brand: "bg-brand text-white",
};
export function Card({ tone = "lav", className = "", children }: { tone?: Tone; className?: string; children: ReactNode }) {
  return <section className={`rounded-[24px] p-4 ${TONES[tone]} ${className}`}>{children}</section>;
}

export function Chip({ children, tone = "gold" }: { children: ReactNode; tone?: "gold" | "brand" | "teal" | "coral" | "lav" }) {
  const c = { gold: "bg-gold text-gold-ink", brand: "bg-brand text-white", teal: "bg-teal text-white", coral: "bg-coral text-white", lav: "bg-lav text-brand-dark" }[tone];
  return <span className={`inline-flex items-center rounded-pill px-2.5 py-0.5 text-xs font-extrabold ${c}`}>{children}</span>;
}

type Variant = "primary" | "outline" | "danger" | "danger-outline" | "soft" | "teal";
const V: Record<Variant, string> = {
  primary: "bg-brand text-white", teal: "bg-teal text-white", soft: "bg-lav text-brand-dark",
  outline: "border-[3px] border-brand bg-white text-brand-dark",
  danger: "bg-[#B3261E] text-white", "danger-outline": "border-[3px] border-[#B3261E] bg-white text-[#B3261E]",
};
export function Btn({ variant = "primary", className = "", ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return <button type="button" {...rest} className={`flex min-h-[56px] w-full items-center justify-center gap-2 rounded-pill px-4 text-lg font-extrabold disabled:opacity-50 ${V[variant]} ${className}`} />;
}

export function Toggle({ on, onChange, label, disabled }: { on: boolean; onChange: (v: boolean) => void; label: string; disabled?: boolean }) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label} disabled={disabled} onClick={() => onChange(!on)}
      className={`relative h-9 w-16 shrink-0 rounded-pill transition-colors disabled:opacity-50 ${on ? "bg-teal" : "bg-[#C9C6EE]"}`}>
      <span className={`absolute top-1 h-7 w-7 rounded-full bg-white transition-all ${on ? "left-8" : "left-1"}`} />
    </button>
  );
}

export function Avatar({ name, color = "#0F766E", size = 44 }: { name: string; color?: string; size?: number }) {
  return (
    <span className="flex shrink-0 items-center justify-center rounded-full font-extrabold text-white" style={{ width: size, height: size, backgroundColor: color, fontSize: size * 0.42 }}>
      {name.charAt(0).toUpperCase()}
    </span>
  );
}

export function Segmented<T extends string | number>({ options, value, onChange }: { options: { id: T; label: string; hint?: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="flex rounded-pill bg-lav p-1" role="radiogroup">
      {options.map((o) => (
        <button key={String(o.id)} type="button" role="radio" aria-checked={value === o.id} onClick={() => onChange(o.id)}
          className={`min-h-[48px] flex-1 rounded-pill px-2 text-base font-extrabold leading-tight ${value === o.id ? "bg-brand text-white" : "text-brand-dark"}`}>
          {o.label}{o.hint && <span className="block text-[11px] font-semibold opacity-90">{o.hint}</span>}
        </button>
      ))}
    </div>
  );
}

export function Notice({ children, tone = "cream" }: { children: ReactNode; tone?: "cream" | "lav" }) {
  return <p className={`rounded-[20px] px-4 py-3 text-sm font-bold leading-snug ${tone === "cream" ? "border-2 border-gold bg-cream text-gold-ink" : "bg-lav text-brand-dark"}`}>{children}</p>;
}

export function Page({ children }: { children: ReactNode }) {
  return <div className="app-page space-y-4 px-4 pb-28 pt-3">{children}</div>;
}
