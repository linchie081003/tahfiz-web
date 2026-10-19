import { Link, useLocation } from "react-router-dom";
import { IconSettings } from "./icons/GameIcons";

const btnBase =
  "fixed right-3 top-3 z-30 flex h-10 w-10 items-center justify-center rounded-full border-[3px] border-outline shadow-game-sm transition active:translate-y-0.5";

/** Tombol pengaturan pojok kanan atas — sama di semua halaman app (kecuali login). */
export function SettingsCornerButton() {
  const { pathname } = useLocation();
  if (pathname === "/login") return null;

  const onSettings = pathname === "/settings";

  return (
    <Link
      to="/settings"
      aria-label="Pengaturan"
      aria-current={onSettings ? "page" : undefined}
      className={`${btnBase} ${onSettings ? "bg-brand-light ring-2 ring-brand/40" : "bg-white/95"}`}
    >
      <IconSettings size={20} decorative />
    </Link>
  );
}
