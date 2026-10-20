import { useNavigate } from "react-router-dom";
import type { HomeData } from "../lib/api";
import { CircleMenuButton, type MenuTone } from "./game/CircleMenuButton";
import { useGameToast } from "./game/GameToast";
import { MenuGlyph, type GlyphKey } from "./icons/MenuGlyphs";

type Item = {
  key: GlyphKey;
  menuKey: string;
  label: string;
  path: string;
  tone: MenuTone;
  alwaysOpen?: boolean;
  soon?: boolean;
  parentOnly?: boolean;
  childOnly?: boolean;
};

const items: Item[] = [
  { key: "tahsin", menuKey: "tahsin", label: "Tahsin", path: "/tahsin", tone: "green" },
  { key: "ziyadah", menuKey: "ziyadah", label: "Ziyadah", path: "/ziyadah", tone: "blue" },
  { key: "murojaah", menuKey: "murojaah", label: "Murojaah", path: "/murojaah", tone: "orange" },
  { key: "ujian", menuKey: "ujian", label: "Ujian", path: "/ujian", tone: "grey", soon: true },
  { key: "peta", menuKey: "peta", label: "Peta", path: "/peta", tone: "teal", alwaysOpen: true },
  { key: "lencana", menuKey: "lencana", label: "Lencana", path: "/lencana", tone: "gold", alwaysOpen: true },
  { key: "quran", menuKey: "ummi", label: "Al-Quran", path: "/quran", tone: "purple", alwaysOpen: true },
  { key: "laporan", menuKey: "laporan", label: "Laporan", path: "/parent/laporan", tone: "red", alwaysOpen: true, parentOnly: true },
  { key: "settings", menuKey: "settings", label: "Pengaturan", path: "/settings", tone: "grey", alwaysOpen: true },
];

export function MenuGrid9({ home, isParent = false }: { home: HomeData; isParent?: boolean }) {
  const nav = useNavigate();
  const toast = useGameToast();
  const visible = items.filter((it) => (it.parentOnly ? isParent : true));

  return (
    <div className="flex flex-wrap justify-center gap-x-5 gap-y-4 px-2 pb-4 pt-2">
      {visible.map((it) => {
        const lockMsg = it.soon ? "Ujian segera hadir." : home.menu_locks[it.menuKey];
        const isLocked = !it.alwaysOpen && Boolean(lockMsg);
        let badge: "check" | "lock" | undefined;
        if (it.key === "tahsin" && home.tahsin_status === "passed") badge = "check";
        if (isLocked) badge = "lock";

        return (
          <div key={it.key} className="flex w-[92px] justify-center">
            <CircleMenuButton
              label={it.label}
              sublabel={it.soon ? "Segera" : isLocked ? "Terkunci" : undefined}
              tone={it.tone}
              locked={isLocked}
              badge={badge}
              icon={<MenuGlyph name={it.key} />}
              onClick={() => {
                if (isLocked) {
                  toast(lockMsg ?? "Belum terbuka");
                  return;
                }
                nav(it.path);
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
