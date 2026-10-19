import { useNavigate } from "react-router-dom";
import type { HomeData } from "../lib/api";

export function MissionCard({ home }: { home: HomeData }) {
  const nav = useNavigate();
  const go = () => {
    const map: Record<string, string> = {
      tahsin: "/tahsin",
      ziyadah: "/ziyadah",
      murojaah: "/murojaah",
      home: "/",
    };
    nav(map[home.mission_action] ?? "/");
  };
  return (
    <div className="card-surface mx-4 flex gap-3 p-4">
      <div className="text-4xl">🌙</div>
      <div className="flex-1">
        <p className="text-xs font-extrabold tracking-wide text-purple-700">{home.mission_title}</p>
        <p className="font-bold text-gray-800">{home.mission_detail}</p>
        <button type="button" className="btn-cta mt-3" onClick={go}>
          ▶ Mulai +{home.mission_xp} XP
        </button>
      </div>
    </div>
  );
}
