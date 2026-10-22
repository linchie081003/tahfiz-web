import { useQuery } from "@tanstack/react-query";
import { NavLink, useLocation } from "react-router-dom";
import { api } from "../lib/api";
import { NavBook, NavChart, NavChat, NavHome, NavMic, NavSliders, NavSprout } from "./icons/NavIcons";

type IconC = typeof NavHome;

const itemCls = (active: boolean) =>
  `flex min-h-[56px] min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-[22px] px-1 text-[12px] font-extrabold leading-tight ${
    active ? "bg-lav text-brand-dark" : "text-muted"
  }`;

function FooterLink({ to, label, icon: Icon, end }: { to: string; label: string; icon: IconC; end?: boolean }) {
  return (
    <NavLink to={to} end={end} className={({ isActive }) => itemCls(isActive)}>
      <Icon size={22} />
      {label}
    </NavLink>
  );
}

export function AppFooterMenu() {
  const { pathname } = useLocation();
  const session = useQuery({
    queryKey: ["session"],
    queryFn: () => api<{ role: string; member_id?: string | null }>("/auth/session"),
    staleTime: 60_000,
  });
  const isParent = session.data?.role === "parent" && !session.data?.member_id;
  if (["/login", "/gabung", "/guru/masuk", "/guru/daftar", "/onboarding", "/parent/gerbang", "/parent/persetujuan"].includes(pathname) || /^\/tahsin\/\d/.test(pathname)) return null;

  return (
    <nav
      className="fixed bottom-0 left-1/2 z-40 w-full max-w-game -translate-x-1/2 bg-brand-light"
      aria-label="Menu utama"
    >
      <div className="flex items-stretch justify-around gap-1 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2">
        {isParent ? (
          <>
            <FooterLink to="/" label="Ringkasan" icon={NavHome} end />
            <FooterLink to="/parent/laporan" label="Laporan" icon={NavChart} />
            <FooterLink to="/quran" label="Tilawah" icon={NavBook} />
            <FooterLink to="/parent/pesan" label="Pesan" icon={NavChat} />
            <FooterLink to="/parent/keluarga" label="Pengaturan" icon={NavSliders} />
          </>
        ) : (
          <>
            <FooterLink to="/" label="Beranda" icon={NavHome} end />
            <FooterLink to="/tahsin" label="Tahsin" icon={NavMic} />
            <FooterLink to="/ziyadah" label="Hafalan" icon={NavSprout} />
            <FooterLink to="/quran" label="Tilawah" icon={NavBook} />
          </>
        )}
      </div>
    </nav>
  );
}
