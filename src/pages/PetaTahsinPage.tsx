import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { api, type HomeData } from "../lib/api";
import { NavPlay, NavStar } from "../components/icons/NavIcons";

type Pt = { point: number; name: string; mandatory: boolean; passed: boolean; best_score: number; decided_by: string | null };
type Ov = { points: Pt[]; gate_open: boolean; all_passed: boolean; threshold: number };

const stars = (p: Pt) => (!p.best_score ? 0 : p.best_score >= 9 ? 3 : p.passed ? 2 : 1);

function Stars({ n, dim }: { n: number; dim?: boolean }) {
  return (
    <span className="flex gap-0.5" aria-label={`${n} dari 3 bintang`}>
      {[1, 2, 3].map((i) => <NavStar key={i} size={20} className={i <= n ? "text-gold" : dim ? "text-white/40" : "text-white/40"} />)}
    </span>
  );
}

/** Peta Tahsin: sembilan pulau. Pulau 1–3 wajib berurutan, 4–9 bebas urutan. */
export function PetaTahsinPage() {
  const nav = useNavigate();
  const ov = useQuery({ queryKey: ["tahsin-points", "self"], queryFn: () => api<Ov>("/tahsin/points") });
  const home = useQuery({ queryKey: ["home"], queryFn: () => api<HomeData>("/home") });
  if (!ov.data) return <p className="p-8 text-center font-extrabold text-muted">Memuat…</p>;
  const { points, gate_open, all_passed } = ov.data;
  const gateBy = points.filter((p) => p.mandatory).some((p) => p.decided_by === "teacher") ? "guru" : "Ayah atau Ibu";
  const firstOpen = points.find((p) => !p.mandatory && !p.passed && p.best_score > 0)?.point;
  const pct = Math.min(100, Math.max(0, (home.data?.level_progress ?? 0) * 100));

  return (
    <div className="pb-28">
      <div className="flex items-center gap-3 px-4 pt-3">
        <button type="button" aria-label="Kembali" onClick={() => nav("/")} className="-ml-2 flex h-11 w-11 items-center justify-center text-brand">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg>
        </button>
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-teal text-lg font-extrabold text-white">{home.data?.level ?? 1}</span>
        <div className="h-3.5 flex-1 overflow-hidden rounded-pill bg-lav" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100} aria-label="Kemajuan level"><div className="h-full rounded-pill bg-teal" style={{ width: `${pct}%` }} /></div>
        <span className="flex items-center gap-1 text-lg font-extrabold"><NavStar size={26} className="text-gold" />{home.data?.xp ?? 0}</span>
      </div>

      <svg viewBox="0 0 390 150" className="mt-2 w-full" role="img" aria-label="Pulau di tengah laut">
        <rect width="390" height="150" fill="#FFE585" />
        <circle cx="150" cy="62" r="34" fill="#FFF3B8" />
        <path d="M40 115 Q195 40 350 115 Z" fill="#F2C879" />
        <path d="M110 112 Q195 62 280 112 Z" fill="#0F766E" />
        <path d="M232 64v38" stroke="#7A4A1A" strokeWidth="4" strokeLinecap="round" />
        <path d="M232 64q-18-14-34-6M232 64q18-14 34-6M232 64q-4-20-16-24M232 64q4-20 18-24" stroke="#0F766E" strokeWidth="5" fill="none" strokeLinecap="round" />
        <path d="M0 118 Q50 104 100 118 T200 118 T300 118 T390 118 V150 H0 Z" fill="#14907F" />
        <path d="M0 132 Q50 120 100 132 T200 132 T300 132 T390 132 V150 H0 Z" fill="#0F766E" />
        <path d="M335 38l8 8-8 8-8-8z" fill="#F2B01E" />
      </svg>

      <div className="space-y-3 px-4 pt-4">
        <p className="flex gap-2 rounded-[20px] bg-[#E4F3F0] p-3 text-sm font-bold text-outline">
          <span aria-hidden="true">ⓘ</span>
          <span>{gate_open ? "Pulau 1–3 wajib dan sudah lulus. " : "Pulau 1–3 wajib dan dikerjakan berurutan. "}Pulau 4–9 {gate_open ? "terbuka dan " : ""}boleh dikerjakan dalam urutan apa saja. Lulus diputuskan guru atau orang tua; AI hanya pra-cek.</span>
        </p>

        {points.map((p) => {
          const must = p.mandatory;
          const current = p.point === firstOpen;
          const locked = must && !p.passed && points.some((q) => q.mandatory && q.point < p.point && !q.passed);
          const tone = p.passed ? "bg-teal text-white" : current ? "bg-brand text-white ring-[3px] ring-brand ring-offset-2" : locked ? "bg-lav text-muted" : "bg-[#6C63C9] text-white";
          const label = p.passed ? "Lulus" : current ? "Sedang dijelajahi" : locked ? "Terkunci" : "Terbuka";
          return (
            <div key={p.point}>
              <Link to={locked ? "#" : `/tahsin/${p.point}`} aria-disabled={locked} aria-label={`Pulau ${p.point}, ${p.name}, ${label}`} className={`flex min-h-[84px] items-center gap-3 rounded-pill p-3 pr-5 ${tone}`}>
                <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-2xl font-extrabold ring-4 ring-white ${p.passed ? "bg-gold text-gold-ink" : current ? "bg-white text-brand ring-gold" : "bg-[#E4F3F0] text-teal"}`}>{p.point}</span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2 text-xs font-extrabold"><span className="rounded-pill bg-cream px-2 py-0.5 text-gold-ink">{must ? "WAJIB" : "PILIHAN"}</span>{label}</span>
                  <span className="block text-lg font-extrabold leading-tight">{p.point}-{p.name}</span>
                  <Stars n={stars(p)} />
                </span>
                {!locked && <span className="shrink-0" aria-hidden="true">{p.passed ? "↻" : <NavPlay size={26} />}</span>}
              </Link>
              {p.point === 3 && gate_open && (
                <div className="mt-3 flex items-center gap-3 rounded-[24px] border-[3px] border-gold bg-cream p-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gold text-xl" aria-hidden="true">🛡</span>
                  <div><p className="font-extrabold text-outline">Gerbang hafalan terbuka</p><p className="text-sm font-bold text-gold-ink">Pulau 1–3 lulus. Disetujui {gateBy}.</p></div>
                </div>
              )}
            </div>
          );
        })}

        <div className={`flex items-center gap-3 rounded-[24px] p-4 ${all_passed ? "bg-gold text-gold-ink" : "bg-lav text-outline"}`}>
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/60 text-xl" aria-hidden="true">{all_passed ? "★" : "🔒"}</span>
          <div><p className="text-lg font-extrabold">Harta karun Tahsin</p><p className="text-sm font-bold opacity-90">{all_passed ? "Sembilan pulau selesai! Sertifikat besar terbuka." : "Selesaikan 9 pulau untuk membuka sertifikat besar"}</p></div>
        </div>
      </div>
    </div>
  );
}
