import { useNavigate } from "react-router-dom";
import type { HomeData } from "../lib/api";
import { CircleMenuButton } from "./game/CircleMenuButton";
import { useGameToast } from "./game/GameToast";
import { MenuIcon, type MenuIconKey } from "./icons/GameIcons";

const items: { key: MenuIconKey; menuKey: string; label: string; path: string; alwaysOpen?: boolean }[] = [
  { key: "tahsin", menuKey: "tahsin", label: "Tahsin", path: "/tahsin" },
  { key: "ziyadah", menuKey: "ziyadah", label: "Ziyadah", path: "/ziyadah" },
  { key: "murojaah", menuKey: "murojaah", label: "Murojaah", path: "/murojaah" },
  { key: "quran", menuKey: "ummi", label: "Alquran", path: "/quran", alwaysOpen: true },
  { key: "peta", menuKey: "peta", label: "Perjalanan Juz Amma", path: "/peta", alwaysOpen: true },
  { key: "lencana", menuKey: "lencana", label: "Lencana", path: "/lencana", alwaysOpen: true },
];

export function MenuGrid9({ home }: { home: HomeData }) {
  const nav = useNavigate();
  const toast = useGameToast();

  return (
    <div className="grid grid-cols-3 gap-x-2 gap-y-5 px-3 pb-6 pt-1">
      {items.map((it) => {
        const lockMsg = home.menu_locks[it.menuKey];
        const isLocked = !it.alwaysOpen && Boolean(lockMsg);
        let badge: "check" | "lock" | undefined;
        if (it.key === "tahsin" && home.tahsin_status === "passed") badge = "check";
        if (isLocked) badge = "lock";

        return (
          <CircleMenuButton
            key={it.key}
            label={it.label}
            locked={isLocked}
            badge={badge}
            icon={<MenuIcon name={it.key} size={28} decorative={isLocked} />}
            onClick={() => {
              if (isLocked) {
                toast(lockMsg ?? "Belum terbuka");
                return;
              }
              nav(it.path);
            }}
          />
        );
      })}
    </div>
  );
}
