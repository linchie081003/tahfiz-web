import { useLocation } from "react-router-dom";
import { IconLogout } from "./icons/GameIcons";
import { useLogout } from "../lib/auth";

const btnBase =
  "fixed left-3 top-3 z-30 flex h-10 w-10 items-center justify-center rounded-full border-[3px] border-outline bg-white/95 shadow-game-sm transition active:translate-y-0.5";

/** Tombol keluar pojok kiri atas — gaya sama dengan pengaturan kanan atas. */
export function LogoutCornerButton() {
  const { pathname } = useLocation();
  const logout = useLogout();

  if (pathname === "/login") return null;

  return (
    <button type="button" aria-label="Keluar" className={btnBase} onClick={logout}>
      <IconLogout size={20} decorative />
    </button>
  );
}
