import { useQuery } from "@tanstack/react-query";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { IconHome, IconLaporan, IconLogout, IconSettings } from "./icons/GameIcons";
import { api } from "../lib/api";
import { useLogout } from "../lib/auth";
import { useParentDashboardOpen } from "../context/ParentDashboardOpenContext";

function FooterLink({
  to,
  label,
  icon: Icon,
  end,
}: {
  to: string;
  label: string;
  icon: typeof IconHome;
  end?: boolean;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex min-w-0 flex-1 flex-col items-center gap-0.5 px-1 py-1 text-[10px] font-extrabold leading-tight ${
          isActive ? "text-brand" : "text-outline/80"
        }`
      }
    >
      {({ isActive }) => (
        <>
          <span
            className={`flex h-9 w-9 items-center justify-center rounded-full border-2 border-outline ${
              isActive ? "bg-brand-light shadow-game-sm" : "bg-white"
            }`}
          >
            <Icon size={18} decorative />
          </span>
          {label}
        </>
      )}
    </NavLink>
  );
}

function FooterAction({
  label,
  icon: Icon,
  active,
  onClick,
}: {
  label: string;
  icon: typeof IconHome;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-w-0 flex-1 flex-col items-center gap-0.5 px-1 py-1 text-[10px] font-extrabold leading-tight ${
        active ? "text-brand" : "text-outline/80"
      }`}
    >
      <span
        className={`flex h-9 w-9 items-center justify-center rounded-full border-2 border-outline ${
          active ? "bg-brand-light shadow-game-sm" : "bg-white"
        }`}
      >
        <Icon size={18} decorative />
      </span>
      {label}
    </button>
  );
}

export function AppFooterMenu() {
  const { pathname } = useLocation();
  const nav = useNavigate();
  const logout = useLogout();
  const session = useQuery({
    queryKey: ["session"],
    queryFn: () => api<{ role: string }>("/auth/session"),
    staleTime: 60_000,
  });
  const isParent = session.data?.role === "parent";
  const { open: dashOpen, setOpen: setDashOpen, toggle: toggleDash } = useParentDashboardOpen();

  if (pathname === "/login") return null;

  const onDashboard = () => {
    if (pathname !== "/") {
      setDashOpen(true);
      nav("/");
      return;
    }
    toggleDash();
  };

  return (
    <nav
      className="fixed bottom-0 left-1/2 z-40 w-full max-w-game -translate-x-1/2 border-t-[3px] border-outline bg-white/95 shadow-[0_-4px_0_rgba(43,27,94,0.08)] backdrop-blur-sm"
      aria-label="Menu utama"
    >
      <div className="flex items-stretch justify-around px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2">
        <FooterLink to="/" label="Home" icon={IconHome} end />
        {isParent && (
          <FooterAction
            label={dashOpen && pathname === "/" ? "Sembunyikan" : "Dashboard"}
            icon={IconLaporan}
            active={dashOpen && pathname === "/"}
            onClick={onDashboard}
          />
        )}
        <FooterLink to="/settings" label="Atur" icon={IconSettings} />
        <FooterAction label="Keluar" icon={IconLogout} onClick={logout} />
      </div>
    </nav>
  );
}
