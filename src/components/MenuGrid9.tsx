import { useNavigate } from "react-router-dom";
import type { HomeData } from "../lib/api";

const items = [
  { key: "tahsin", label: "Tahsin", color: "bg-menu-tahsin", path: "/tahsin", icon: "🎤" },
  { key: "ziyadah", label: "Ziyadah", color: "bg-menu-ziyadah", path: "/ziyadah", icon: "📘" },
  { key: "murojaah", label: "Murojaah", color: "bg-menu-murojaah", path: "/murojaah", icon: "🔄" },
  { key: "ujian", label: "Ujian", color: "bg-menu-ujian", path: "/ujian", icon: "🔒" },
  { key: "peta", label: "Peta", color: "bg-menu-peta", path: "/peta", icon: "🚩" },
  { key: "lencana", label: "Lencana", color: "bg-menu-lencana", path: "/lencana", icon: "🏆" },
  { key: "referensi", label: "Al-Qur'an", color: "bg-menu-referensi", path: "/quran", icon: "📖" },
  { key: "laporan", label: "Laporan", color: "bg-menu-laporan", path: "/laporan", icon: "📊" },
  { key: "settings", label: "Pengaturan", color: "bg-menu-settings", path: "/settings", icon: "⚙️" },
];

export function MenuGrid9({ home }: { home: HomeData }) {
  const nav = useNavigate();
  return (
    <div className="grid grid-cols-3 gap-4 px-4 pb-8">
      {items.map((it) => {
        const lock = home.menu_locks[it.key];
        const locked = Boolean(lock);
        return (
          <button
            key={it.key}
            type="button"
            className="text-center"
            onClick={() => {
              if (locked) {
                alert(lock);
                return;
              }
              nav(it.path);
            }}
          >
            <div className={`menu-circle ${locked ? "bg-gray-400 opacity-80" : it.color} relative`}>
              {it.icon}
              {it.key === "tahsin" && home.tahsin_status === "passed" && (
                <span className="absolute -right-1 -top-1 rounded-full bg-white px-1 text-xs text-green-600">✓</span>
              )}
            </div>
            <p className="mt-2 text-sm font-bold text-white">{it.label}</p>
          </button>
        );
      })}
    </div>
  );
}
