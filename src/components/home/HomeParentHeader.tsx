import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { StatusBadge } from "../game/StatusBadge";
import { NavChart, NavStar } from "../icons/NavIcons";
import { formatFamilyCodeDisplay } from "../../lib/familyCode";
import { api } from "../../lib/api";

type ChildSummary = { id: string; name: string; color: string; pending_setor: number; tahsin_status: string; xp: number };
type Dashboard = { family_name: string; family_access_code: string; queue_total: number; children: ChildSummary[] };

type Props = {
  name: string;
  memberId?: string | null;
  memberName?: string | null;
  dashOpen?: boolean;
  onOpenDash?: () => void;
  onCloseDash?: () => void;
  queueTotal: number;
};

/** Ringkasan orang tua: antrean penilaian, anak, tautan laporan. */
export function HomeParentHeader({ name, memberId, memberName, queueTotal }: Props) {
  const { data } = useQuery({
    queryKey: ["parent-dashboard"],
    queryFn: () => api<Dashboard>("/parent/dashboard"),
    staleTime: 30_000,
  });
  const pending = queueTotal > 0;
  return (
    <div className="space-y-4">
      <header>
        <p className="text-sm font-bold text-brand-dark">Area orang tua · Halo, {name}</p>
        <h1 className="text-[28px] font-extrabold leading-tight text-outline">Ringkasan hari ini</h1>
        {memberId && memberName && <p className="text-sm font-semibold text-muted">Profil aktif: {memberName}</p>}
      </header>

      <div className="flex flex-wrap gap-2">
        {data?.children.map((c) => (
          <Link key={c.id} to="/pilih-profil" className="flex min-h-[48px] items-center gap-2 rounded-pill bg-brand py-1 pl-1 pr-4 text-base font-extrabold text-white">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-brand-dark">{c.name.charAt(0)}</span>
            {c.name}
          </Link>
        ))}
        <Link to="/pilih-profil" className="flex min-h-[48px] items-center rounded-pill bg-brand-light px-4 text-base font-extrabold text-brand-dark">
          + Anak
        </Link>
      </div>

      <Link to="/parent/queue" className={`flex items-center gap-3 rounded-[24px] p-4 ${pending ? "border-2 border-gold bg-cream" : "bg-brand-light"}`}>
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${pending ? "bg-coral text-white" : "bg-white text-brand-dark"}`}>
          <NavStar size={22} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-base font-extrabold text-outline">Antrean penilaian</span>
          <span className="block text-sm font-semibold text-muted">
            {pending ? `${queueTotal} setoran menunggu keputusan Anda` : "Tidak ada setoran menunggu"}
          </span>
        </span>
        <span className="text-lg font-extrabold text-outline">{queueTotal}</span>
      </Link>

      {data && (
        <ul className="space-y-2.5">
          {data.children.map((c) => (
            <li key={c.id} className="flex items-center gap-3 rounded-[24px] bg-lav p-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-lg font-extrabold text-white" style={{ backgroundColor: c.color }}>
                {c.name.charAt(0)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-base font-extrabold text-outline">{c.name}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <StatusBadge kind="tahsin" code={c.tahsin_status} size="sm" compact />
                  <span className="text-xs font-bold text-muted">{c.xp} bintang</span>
                  {c.pending_setor > 0 && <span className="text-xs font-extrabold text-coral">{c.pending_setor} setoran</span>}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      {data && <p className="text-xs font-semibold text-muted">Kode keluarga untuk anak: {formatFamilyCodeDisplay(data.family_access_code)}</p>}

      <Link to="/parent/laporan" className="flex min-h-[56px] items-center justify-between rounded-pill bg-teal px-5 text-base font-extrabold text-white">
        <span className="flex items-center gap-2"><NavChart size={22} /> Lihat laporan lengkap</span>
        <span aria-hidden>›</span>
      </Link>
    </div>
  );
}
