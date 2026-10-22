import { useQuery } from "@tanstack/react-query";
import { NavLink, Navigate, Outlet } from "react-router-dom";
import { api, getToken } from "../../lib/api";
import { NavHome, NavMic, NavSprout } from "../../components/icons/NavIcons";

export type Teacher = { id: string; name: string; email: string; kind: string; status: string; invite_code: string; grading_target_hours: number; is_admin: boolean; institution_name: string | null };

export function useTeacher() {
  return useQuery({ queryKey: ["teacher-me"], queryFn: () => api<Teacher>("/teacher/me"), enabled: !!getToken(), retry: false });
}

const cls = (a: boolean) => `flex min-h-[56px] flex-1 flex-col items-center justify-center gap-0.5 rounded-[22px] px-1 text-[12px] font-extrabold ${a ? "bg-lav text-brand-dark" : "text-muted"}`;

export function GuruShell() {
  const me = useTeacher();
  if (!getToken()) return <Navigate to="/guru/masuk" replace />;
  if (me.isError) return <Navigate to="/guru/masuk" replace />;
  if (!me.data) return <div className="app-shell"><p className="p-8 text-center font-extrabold text-muted">Memuat…</p></div>;
  return (
    <div className="app-shell">
      <div className="game-scene pb-24 pt-3"><Outlet /></div>
      <nav className="fixed bottom-0 left-1/2 z-40 w-full max-w-game -translate-x-1/2 bg-brand-light" aria-label="Menu guru">
        <div className="flex gap-1 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2">
          <NavLink to="/guru" end className={({ isActive }) => cls(isActive)}><NavHome size={22} />Beranda</NavLink>
          <NavLink to="/guru/setoran" className={({ isActive }) => cls(isActive)}><NavMic size={22} />Setoran</NavLink>
          <NavLink to="/guru/murid" className={({ isActive }) => cls(isActive)}><NavSprout size={22} />Murid</NavLink>
        </div>
      </nav>
    </div>
  );
}
