import { useEffect, useState } from "react";
import { surahName } from "../../lib/surahInfo";
import { loadTilawah, resumePoint } from "../../lib/tilawahProgress";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { api } from "../../lib/api";
import type { AgeMode } from "../../context/AgeModeContext";
import type { HomeData } from "../../lib/api";
import { useLogout } from "../../lib/auth";
import { Mascot } from "../game/Mascot";
import { NavBook, NavCheck, NavDrop, NavFlame, NavMic, NavPlay, NavSprout, NavStar } from "../icons/NavIcons";

const ACTION_PATH: Record<string, string> = { tahsin: "/tahsin", ziyadah: "/ziyadah", murojaah: "/murojaah", home: "/" };
const ACTION_LABEL: Record<string, string> = { tahsin: "Tahsin", ziyadah: "Hafalan baru", murojaah: "Murajaah" };

type Row = { key: string; title: string; sub: string; path: string; icon: React.ReactNode; state: "done" | "now" | "wait"; note: string; locked: boolean };

function rows(home: HomeData): Row[] {
  const tahsinOk = home.tahsin_status === "passed";
  const act = home.mission_action;
  const lock = (k: string) => home.menu_locks[k] || "";
  const items = home.mission_items ?? {};
  const afterTahsin = act === "ziyadah" || act === "home";
  return [
    {
      key: "murojaah",
      title: "Murajaah",
      sub: lock("murojaah") || items.murojaah || (afterTahsin && tahsinOk ? "Belum ada hafalan untuk diulang" : "Ulang hafalan yang sudah lulus"),
      path: "/murojaah",
      icon: <NavDrop size={22} />,
      state: act === "murojaah" ? "now" : tahsinOk && afterTahsin && items.murojaah === undefined && act === "home" ? "done" : "wait",
      note: act === "murojaah" ? "Sekarang" : act === "home" && tahsinOk ? "Selesai" : lock("murojaah") ? "Setelah tahsin" : "Nanti",
      locked: !!lock("murojaah"),
    },
    {
      key: "tahsin",
      title: "Tahsin",
      sub: home.tahsin_status === "pending_eval" ? "Menunggu penilaian" : tahsinOk ? "Pulau 1–3 sudah lulus" : items.tahsin || "Latihan huruf dan harakat",
      path: "/tahsin",
      icon: <NavMic size={22} />,
      state: act === "tahsin" ? "now" : tahsinOk ? "done" : "wait",
      note: act === "tahsin" ? "Sekarang" : tahsinOk ? "Selesai" : "Nanti",
      locked: false,
    },
    {
      key: "ziyadah",
      title: "Hafalan baru",
      sub: lock("ziyadah") || items.ziyadah || home.mission_detail,
      path: "/ziyadah",
      icon: <NavSprout size={22} />,
      state: act === "ziyadah" ? "now" : "wait",
      note: act === "ziyadah" ? "Sekarang" : lock("ziyadah") ? "Setelah tahsin" : "Nanti",
      locked: !!lock("ziyadah"),
    },
  ];
}

function MissionRow({ r }: { r: Row }) {
  const nav = useNavigate();
  const tone =
    r.state === "done"
      ? "bg-teal text-white"
      : r.state === "now"
        ? "bg-brand text-white ring-[3px] ring-brand ring-offset-2 ring-offset-white"
        : "bg-lav text-outline";
  const chip =
    r.state === "done" ? "border-[3px] border-white bg-gold text-gold-ink" : r.state === "now" ? "border-[3px] border-gold bg-white text-brand" : "bg-[#D9D6F0] text-[#6B6A9A]";
  return (
    <button
      type="button"
      disabled={r.locked}
      onClick={() => nav(r.path)}
      className={`flex min-h-[64px] w-full items-center gap-3 rounded-pill py-2 pl-2.5 pr-[18px] text-left ${tone}`}
    >
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${chip}`}>
        {r.state === "done" ? <NavCheck size={22} /> : r.icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-base font-extrabold leading-tight">{r.title}</span>
        <span className={`block truncate text-[13px] font-semibold ${r.state === "wait" ? "text-[#5B5880]" : "opacity-90"}`}>{r.sub}</span>
      </span>
      <span className={`shrink-0 text-sm font-extrabold ${r.state === "wait" ? "text-brand-dark" : ""}`}>{r.note}</span>
    </button>
  );
}

function Banner({ home }: { home: HomeData }) {
  return (
    <div className="relative -mx-4 -mt-1 h-[112px] overflow-hidden bg-[#FFE48A]">
      <svg viewBox="0 0 390 150" preserveAspectRatio="xMidYMax slice" aria-hidden="true" className="absolute inset-0 h-full w-full">
        <circle cx="300" cy="50" r="26" fill="#FFF3B8" />
        <path d="M0 118 Q50 108 100 118 T200 118 T300 118 T390 118 V150 H0Z" fill="#7CC4BB" />
        <path d="M0 130 Q50 120 100 130 T200 130 T300 130 T390 130 V150 H0Z" fill="#0F766E" />
        <ellipse cx="300" cy="116" rx="70" ry="10" fill="#F2B01E" />
        <path d="M250 114 Q300 60 352 114Z" fill="#FAC775" />
        <rect x="330" y="64" width="4" height="40" rx="2" fill="#8A6A44" />
        <path d="M332 66c-12-8-24-4-28 4 10-2 20-2 28-4zM332 66c12-8 24-4 28 4-10-2-20-2-28-4z" fill="#0A4F4A" />
      </svg>
      <div className="relative flex h-full items-center gap-3 px-4">
        <Mascot mood={home.mission_xp > 0 ? "happy" : "default"} size={56} className="shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-gold-ink">Assalamu'alaikum,</p>
          <p className="truncate text-2xl font-extrabold leading-tight text-outline">{home.greeting_name}</p>
        </div>
        <span className="mt-8 flex shrink-0 items-center gap-1 rounded-pill bg-white px-3 py-1.5 text-sm font-extrabold text-outline">
          <NavFlame size={18} className="text-coral" />
          {home.streak_days} hari
        </span>
      </div>
    </div>
  );
}

/** Beranda anak: HUD, sapaan, misi hari ini, tombol lanjut, Tilawah dan Orang tua. */
export function HomeChildScene({ home }: { home: HomeData; ageMode: AgeMode }) {
  const nav = useNavigate();
  const logout = useLogout();
  const pct = Math.min(100, Math.max(0, home.level_progress * 100));
  const list = rows(home);
  const done = list.filter((r) => r.state === "done").length;
  const next = ACTION_LABEL[home.mission_action];
  const [, bump] = useState(0);
  useEffect(() => { const f = () => bump((n) => n + 1); window.addEventListener("hafiz_tilawah_changed", f); return () => window.removeEventListener("hafiz_tilawah_changed", f); }, []);
  const resume = resumePoint(loadTilawah());
  const lastName = resume ? `${surahName(resume.surah)}, ayat ${resume.ayah}` : "";
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-teal text-lg font-extrabold text-white" aria-label={`Level ${home.level}`}>
          {home.level}
        </span>
        <div className="h-3.5 flex-1 overflow-hidden rounded-pill bg-lav" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100} aria-label="Kemajuan level">
          <div className="h-full rounded-pill bg-teal" style={{ width: `${pct}%` }} />
        </div>
        <button type="button" onClick={() => nav("/lencana")} className="flex items-center gap-1 text-lg font-extrabold text-outline" aria-label={`${home.xp} bintang, buka lencana`}>
          <NavStar size={26} className="text-gold" />
          {home.xp}
        </button>
      </div>

      <Banner home={home} />

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-extrabold text-outline">Misi hari ini</h2>
        <span className="text-[13px] font-bold text-[#5B5880]">sekitar 12 menit</span>
      </div>
      <div className="flex gap-1.5" role="img" aria-label={`${done} dari 3 langkah selesai`}>
        {[0, 1, 2].map((i) => <div key={i} className={`h-2.5 flex-1 rounded-[5px] ${i < done ? "bg-teal" : "bg-[#D9D6F0]"}`} />)}
      </div>
      <div className="space-y-2">
        {list.map((r) => <MissionRow key={r.key} r={r} />)}
      </div>

      {next && (
        <button type="button" onClick={() => nav(ACTION_PATH[home.mission_action] ?? "/")} className="btn-cta">
          <NavPlay size={20} /> Lanjut: {next}
        </button>
      )}

      <div className="grid grid-cols-2 gap-3">
        <button type="button" onClick={() => nav(resume ? `/quran/${resume.surah}?ayat=${resume.ayah}` : "/quran/1")} className="min-h-[112px] rounded-[28px] bg-[#6B63C9] p-4 text-left text-white">
          <span className="flex items-center gap-2 text-lg font-extrabold"><NavBook size={22} /> Tilawah</span>
          <span className="mt-1 block text-[13px] font-semibold opacity-95">{lastName ? `Lanjut ${lastName}` : "Mulai membaca Al-Qur'an"}</span>
        </button>
        {home.parent_preview ? (
          <button type="button" onClick={() => nav("/parent/gerbang")} className="min-h-[112px] rounded-[28px] bg-teal p-4 text-left text-white">
            <span className="block text-lg font-extrabold">Orang tua</span>
            <span className="mt-1 block text-[13px] font-semibold opacity-95">Lihat perkembangan belajar</span>
          </button>
        ) : (
          <button type="button" onClick={() => nav("/lencana")} className="min-h-[112px] rounded-[28px] bg-teal p-4 text-left text-white">
            <span className="block text-lg font-extrabold">Lencana</span>
            <span className="mt-1 block text-[13px] font-semibold opacity-95">Hadiah dari belajarmu</span>
          </button>
        )}
      </div>
      <button type="button" onClick={logout} className="min-h-[44px] w-full text-sm font-extrabold text-muted">Keluar</button>
    </div>
  );
}

export function HomeMissionCta() {
  return null;
}
