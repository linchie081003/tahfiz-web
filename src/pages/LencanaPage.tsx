import { useQuery } from "@tanstack/react-query";
import { BadgeIcon } from "../components/BadgeIcon";
import { LevelCard, type Progress } from "../components/LevelCard";
import { GameHeader } from "../components/game/GameHeader";
import { AppPage } from "../components/layout/AppPage";
import { api } from "../lib/api";

type Badge = { id: string; title: string; description: string; earned: boolean; kind?: string | null; earned_at?: string | null; progress?: number | null; target?: number | null };
type Gam = Progress & { badges: Badge[] };

export function LencanaPage() {
  const { data } = useQuery({ queryKey: ["gamify"], queryFn: () => api<Gam>("/gamify") });
  const ratio = (b: Badge) => (b.target ? (b.progress ?? 0) / b.target : 0);
  const badges = [...(data?.badges ?? [])].sort((a, b) => Number(b.earned) - Number(a.earned) || ratio(b) - ratio(a));
  const got = badges.filter((b) => b.earned).length;
  const pct = badges.length ? Math.round((got / badges.length) * 100) : 0;
  return (
    <AppPage>
      <GameHeader title="Lencana" to="/" />
      {data && <LevelCard g={data} />}

      <section className="mt-4 space-y-2" aria-label="Koleksi lencana">
        <div className="flex items-baseline justify-between">
          <h2 className="text-xl font-extrabold text-outline">Koleksi lencana</h2>
          <span className="text-sm font-extrabold text-brand-dark">{got} dari {badges.length}</span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-pill bg-lav" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Lencana terkumpul">
          <div className="h-full rounded-pill bg-gold transition-[width] duration-500" style={{ width: `${pct}%` }} />
        </div>
      </section>

      <ul className="mt-3 grid grid-cols-2 gap-3">
        {badges.map((b) => (
          <li key={b.id} className={`flex flex-col items-center rounded-[24px] border-[3px] p-3 text-center ${b.earned ? "border-gold bg-[#FFF8DC]" : "border-line bg-lav/60"}`}>
            <div className="relative">
              <BadgeIcon kind={b.kind} earned={b.earned} />
              {!b.earned && <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-white text-sm shadow" aria-hidden="true">🔒</span>}
              {b.earned && <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-teal text-sm font-extrabold text-white shadow" aria-hidden="true">✓</span>}
            </div>
            <p className={`mt-2 font-extrabold leading-tight ${b.earned ? "text-outline" : "text-muted"}`}>{b.title}</p>
            <p className="mt-0.5 text-xs font-semibold text-muted">{b.earned ? (b.earned_at ? `Diperoleh ${new Date(b.earned_at).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}` : "Sudah diperoleh") : b.description}</p>
            {!b.earned && !!b.target && b.target > 1 && (
              <div className="mt-2 w-full" role="progressbar" aria-valuenow={b.progress ?? 0} aria-valuemin={0} aria-valuemax={b.target} aria-label={`${b.progress ?? 0} dari ${b.target}`}>
                <div className="h-2 overflow-hidden rounded-pill bg-white"><div className="h-full rounded-pill bg-brand" style={{ width: `${Math.round(ratio(b) * 100)}%` }} /></div>
                <p className="mt-0.5 text-[11px] font-extrabold text-brand-dark">{b.progress ?? 0} / {b.target}</p>
              </div>
            )}
            <span className={`mt-2 rounded-pill px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wide ${b.earned ? "bg-gold text-outline" : "bg-white text-muted"}`}>{b.earned ? "Terkumpul" : "Terkunci"}</span>
          </li>
        ))}
      </ul>
      {data && !badges.length && <p className="mt-6 text-center font-bold text-muted">Belum ada lencana.</p>}
    </AppPage>
  );
}
