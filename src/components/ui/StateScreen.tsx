import type { ReactNode } from "react";
import { Mascot, type MascotMood } from "../game/Mascot";
import { Btn, Card } from "./ui";

export type Action = { label: string; onClick?: () => void; variant?: "primary" | "outline" | "soft" | "teal"; disabled?: boolean };

/** Layar kondisi untuk anak: maskot, judul, kalimat menenangkan, isi, dan tombol aksi. */
export function StateScreen({ mood = "sad", title, lead, children, actions, link }: {
  mood?: MascotMood; title: string; lead: string; children?: ReactNode; actions: Action[]; link?: Action;
}) {
  return (
    <div className="space-y-4 px-4 pb-28 pt-6 text-center" role="alert">
      <Mascot mood={mood} size={104} className="mx-auto" />
      <h1 className="text-[26px] font-extrabold leading-tight text-outline">{title}</h1>
      <p className="text-lg font-bold text-muted">{lead}</p>
      {children}
      <div className="space-y-2 pt-2">
        {actions.map((a) => <Btn key={a.label} variant={a.variant ?? "primary"} disabled={a.disabled} onClick={a.onClick}>{a.label}</Btn>)}
        {link && <button type="button" onClick={link.onClick} className="min-h-[48px] w-full text-lg font-extrabold text-brand">{link.label}</button>}
      </div>
    </div>
  );
}

export function Steps({ items }: { items: string[] }) {
  return (
    <Card tone="lav" className="space-y-2 text-left">
      {items.map((t, i) => (
        <div key={t} className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand text-lg font-extrabold text-white">{i + 1}</span>
          <p className="font-bold text-outline">{t}</p>
        </div>
      ))}
    </Card>
  );
}

export function Tips({ title, items }: { title: string; items: string[] }) {
  return (
    <Card tone="mint" className="text-left">
      <p className="mb-1 font-extrabold text-outline">{title}</p>
      <ul className="space-y-1">{items.map((t) => <li key={t} className="font-bold text-outline">• {t}</li>)}</ul>
    </Card>
  );
}
