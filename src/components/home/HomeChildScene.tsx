import { useNavigate } from "react-router-dom";
import type { AgeMode } from "../../context/AgeModeContext";
import type { HomeData } from "../../lib/api";
import { Mascot } from "../game/Mascot";
import { NavCheck, NavDrop, NavFlame, NavMic, NavPlay, NavSprout, NavStar } from "../icons/NavIcons";

const ACTION_PATH: Record<string, string> = { tahsin: "/tahsin", ziyadah: "/ziyadah", murojaah: "/murojaah", home: "/" };
const ACTION_LABEL: Record<string, string> = { tahsin: "Tahsin", ziyadah: "Hafalan baru", murojaah: "Murajaah" };

type Row = { key: string; title: string; sub: string; path: string; icon: React.ReactNode; state: "done" | "now" | "wait"; note: string };

function rows(home: HomeData): Row[] {
  const tahsinOk = home.tahsin_status === "passed";
  const act = home.mission_action;
  const lockMsg = (k: string) => home.menu_locks[k];
  return [
    {
      key: "tahsin",
      title: "Tahsin",
      sub: tahsinOk ? "Pulau 1–3 sudah lulus" : home.tahsin_status === "pending_eval" ? "Menunggu penilaian" : "Latihan huruf dan harakat",
      path: "/tahsin",
      icon: <NavMic size={22} />,
      state: tahsinOk && act !== "tahsin" ? "done" : act === "tahsin" ? "now" : "wait",
      note: tahsinOk && act !== "tahsin" ? "Selesai" : act === "tahsin" ? "Sekarang" : "Belum",
    },
    {
      key: "murojaah",
      title: "Murajaah",
      sub: lockMsg("murojaah") || "Ulang hafalan yang sudah lulus",
      path: "/murojaah",
      icon: <NavDrop size={22} />,
      state: act === "murojaah" ? "now" : lockMsg("murojaah") ? "wait" : "wait",
      note: act === "murojaah" ? "Sekarang" : lockMsg("murojaah") ? "Setelah tahsin" : "Nanti",
    },
    {
      key: "ziyadah",
      title: "Hafalan baru",
      sub: lockMsg("ziyadah") || home.mission_detail,
      path: "/ziyadah",
      icon: <NavSprout size={22} />,
      state: act === "ziyadah" ? "now" : "wait",
      note: act === "ziyadah" ? "Sekarang" : lockMsg("ziyadah") ? "Setelah tahsin" : "Nanti",
    },
  ];
}

function MissionRow({ r, locked }: { r: Row; locked: boolean }) {
  const nav = useNavigate();
  const tone =
    r.state === "done"
      ? "bg-teal text-white"
      : r.state === "now"
        ? "bg-brand text-white ring-[3px] ring-gold ring-offset-2 ring-offset-white"
        : "bg-lav text-outline";
  const chip = r.state === "wait" ? "bg-white text-brand-dark" : "bg-gold text-gold-ink";
  return (
    <button
      type="button"
      disabled={locked}
      onClick={() => nav(r.path)}
      className={`flex min-h-[64px] w-full items-center gap-3 rounded-pill p-2 pr-4 text-left ${tone} ${locked ? "opacity-80" : ""}`}
    >
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${chip}`}>
        {r.state === "done" ? <NavCheck size={22} /> : r.icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-base font-extrabold leading-tight">{r.title}</span>
        <span className={`block truncate text-[13px] font-semibold ${r.state === "wait" ? "text-muted" : "opacity-90"}`}>{r.sub}</span>
      </span>
      <span className="shrink-0 text-sm font-extrabold">{r.note}</span>
    </button>
  );
}

/** Beranda anak: HUD, sapaan, misi hari ini, tombol lanjut. */
export function HomeChildScene({ home }: { home: HomeData; ageMode: AgeMode }) {
  const nav = useNavigate();
  const pct = Math.min(100, Math.max(0, home.level_progress * 100));
  const list = rows(home);
  const next = ACTION_LABEL[home.mission_action];
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-teal text-lg font-extrabold text-white" aria-label={`Level ${home.level}`}>
          {home.level}
        </span>
        <div className="h-3.5 flex-1 overflow-hidden rounded-pill bg-lav" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100} aria-label="Kemajuan level">
          <div className="h-full rounded-pill bg-teal" style={{ width: `${pct}%` }} />
        </div>
        <span className="flex items-center gap-1 text-lg font-extrabold text-outline" aria-label={`${home.xp} bintang`}>
          <NavStar size={26} className="text-gold" />
          {home.xp}
        </span>
      </div>

      <div className="flex items-center gap-3 rounded-[28px] bg-cream p-4">
        <Mascot mood={home.mission_xp > 0 ? "happy" : "default"} size={72} className="shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-gold-ink">Assalamu'alaikum,</p>
          <p className="truncate text-2xl font-extrabold leading-tight text-outline">{home.greeting_name}</p>
        </div>
        <span className="flex shrink-0 items-center gap-1 rounded-pill bg-white px-3 py-1.5 text-sm font-extrabold text-outline">
          <NavFlame size={18} className="text-coral" />
          {home.streak_days} hari
        </span>
      </div>

      <h2 className="text-xl font-extrabold text-outline">Misi hari ini</h2>
      <div className="space-y-2.5">
        {list.map((r) => (
          <MissionRow key={r.key} r={r} locked={r.key !== "tahsin" && !!home.menu_locks[r.key === "murojaah" ? "murojaah" : "ziyadah"]} />
        ))}
      </div>

      {next && home.mission_xp > 0 && (
        <button type="button" onClick={() => nav(ACTION_PATH[home.mission_action] ?? "/")} className="btn-cta">
          <NavPlay size={20} /> Lanjut: {next}
        </button>
      )}

      <div className="grid grid-cols-2 gap-3">
        <button type="button" onClick={() => nav("/peta")} className="min-h-[96px] rounded-[28px] bg-brand p-4 text-left text-white">
          <span className="block text-lg font-extrabold">Peta Tahsin</span>
          <span className="block text-[13px] font-semibold opacity-90">Lihat pulau yang sudah dilalui</span>
        </button>
        <button type="button" onClick={() => nav("/lencana")} className="min-h-[96px] rounded-[28px] bg-teal p-4 text-left text-white">
          <span className="block text-lg font-extrabold">Lencana</span>
          <span className="block text-[13px] font-semibold opacity-90">Hadiah dari belajarmu</span>
        </button>
      </div>
    </div>
  );
}

export function HomeMissionCta() {
  return null;
}
