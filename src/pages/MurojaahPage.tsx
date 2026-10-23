import { surahName } from "../lib/surahInfo";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Btn, Card, Chip, Page, ScreenHead } from "../components/ui/ui";
import { NavPlay, NavStar } from "../components/icons/NavIcons";
import { api, type HomeData } from "../lib/api";

type Item = { id: string; surah_name: string; due_date: string };

const RATINGS = [
  { id: "lancar", label: "Kuat", hint: "Lancar", cls: "bg-teal text-white" },
  { id: "ragu", label: "Cukup", hint: "Masih ragu", cls: "bg-gold text-gold-ink" },
  { id: "lupa", label: "Lemah", hint: "Lupa", cls: "bg-coral text-white" },
] as const;

export function MurojaahPage() {
  const qc = useQueryClient();
  const nav = useNavigate();
  const [done, setDone] = useState<{ name: string; rating: string }[]>([]);
  const { data } = useQuery({ queryKey: ["murojaah"], queryFn: () => api<Item[]>("/murojaah/due") });
  const complete = async (id: string, rating: string) => {
    const it = data?.find((x) => x.id === id);
    if (it) setDone((d) => [...d, { name: it.surah_name, rating }]);
    await api(`/murojaah/${id}/complete`, { method: "POST", body: JSON.stringify({ rating }) });
    qc.invalidateQueries({ queryKey: ["murojaah"] });
    qc.invalidateQueries({ queryKey: ["home"] });
  };
  if (done.length > 0 && !data?.length) {
    const strong = done.filter((d) => d.rating === "lancar").length;
    const when = (r: string) => (r === "lancar" ? "Ulang lagi sesuai jadwal Kuat" : r === "ragu" ? "Ulang lagi 7 hari (Cukup)" : "Ulang lagi besok");
    return (
      <Page>
        <ScreenHead back={false} eyebrow="Hasil murajaah" title="Murajaah selesai!" sub={`${strong} pohon kuat, ${done.length - strong} pohon perlu disiram`} />
        {done.map((d, i) => (
          <Card key={i} tone="lav">
            <div className="flex items-center gap-2"><p className="min-w-0 flex-1 text-lg font-extrabold">{d.name}</p><Chip tone={d.rating === "lancar" ? "teal" : d.rating === "ragu" ? "gold" : "coral"}>{d.rating === "lancar" ? "Kuat" : d.rating === "ragu" ? "Cukup" : "Lemah"}</Chip></div>
            <p className="text-sm font-semibold text-muted">{when(d.rating)}</p>
          </Card>
        ))}
        <p className="text-center text-sm font-bold text-muted">Ini penilaianmu sendiri. Guru atau orang tua yang memutuskan status dan jadwal ulang.</p>
        <Btn onClick={() => nav("/")}>Kembali ke beranda</Btn>
      </Page>
    );
  }
  const home = useQuery({ queryKey: ["home"], queryFn: () => api<HomeData>("/home") });
  const peta = useQuery({ queryKey: ["peta", 30], queryFn: () => api<{ nodes: { surah_id: number; name_id: string; status: string }[] }>("/peta/juz/30"), retry: false });
  const due = data ?? [];
  const dueNames = new Set(due.map((x) => x.surah_name));
  const total = due.length + done.length;
  const pct = Math.min(100, Math.max(0, (home.data?.level_progress ?? 0) * 100));
  const Tree = ({ tone }: { tone: string }) => (
    <svg width="44" height="52" viewBox="0 0 44 52" aria-hidden="true"><rect x="20" y="30" width="4" height="20" rx="2" fill="#8A6A44" /><circle cx="22" cy="20" r="16" fill={tone} /><circle cx="17" cy="16" r="3.5" fill="#fff" opacity=".75" /><circle cx="27" cy="21" r="3" fill="#fff" opacity=".75" /></svg>
  );
  const tiles = (peta.data?.nodes ?? []).filter((n) => n.status === "passed"); // hanya surat yang sudah hafal dan lulus
  return (
    <div className="app-shell space-y-3 px-5 pb-28 pt-4">
      <header className="flex items-center gap-3">
        <button type="button" aria-label="Kembali" onClick={() => nav("/")} className="-ml-2 flex h-11 w-11 items-center justify-center text-brand">‹</button>
        <div className="flex flex-1 items-center">
          <span className="z-10 flex h-10 w-10 items-center justify-center rounded-full border-[3px] border-white bg-teal text-xl font-extrabold text-white">{home.data?.level ?? 1}</span>
          <span className="-ml-2.5 h-4 flex-1 overflow-hidden rounded-lg bg-[#D9D6F0]"><span className="block h-4 bg-teal" style={{ width: `${pct}%` }} /></span>
        </div>
        <span className="flex items-center gap-1.5 text-lg font-extrabold text-[#3C3A5C]"><NavStar size={24} className="text-gold" />{home.data?.xp ?? 0}</span>
      </header>

      <div className="-mx-5 h-24 bg-[#FFE680] px-5 py-3.5">
        <h1 className="text-2xl font-extrabold leading-tight text-[#3A2A00]">Taman hafalan</h1>
        <p className="text-sm font-bold text-[#5C4300]">Siram pohonmu dengan murajaah</p>
      </div>

      <div className="flex gap-1 rounded-pill bg-[#E3E0EE] p-1">
        <span aria-current="page" className="flex h-11 flex-1 items-center justify-center rounded-pill bg-brand text-[15px] font-extrabold text-white">Murajaah</span>
        <button type="button" onClick={() => nav("/ziyadah")} className="flex h-11 flex-1 items-center justify-center rounded-pill text-[15px] font-extrabold text-brand-dark">Hafalan baru</button>
      </div>

      <section className="space-y-2.5 rounded-[28px] bg-brand p-4 text-white">
        <div className="flex items-center justify-between"><h2 className="text-lg font-extrabold">Murajaah hari ini</h2><span className="text-[13px] font-bold text-lav">sekitar {Math.max(1, due.length) * 2} menit</span></div>
        <div className="flex gap-1.5" role="img" aria-label={`${done.length} dari ${total} surat selesai`}>
          {Array.from({ length: Math.max(total, 1) }).map((_, i) => <span key={i} className={`h-2 flex-1 rounded ${i < done.length ? "bg-gold" : "bg-white/30"}`} />)}
        </div>
        <p className="text-sm font-bold text-lav">{due.length ? `Tinggal ${due.length} surat: ${due[0].surah_name}` : "Tidak ada murajaah hari ini. Hebat, sampai jumpa besok!"}</p>
        {due.length > 0 && <button type="button" onClick={() => document.getElementById("rate")?.scrollIntoView({ behavior: "smooth" })} className="flex h-14 w-full items-center justify-center gap-2 rounded-pill bg-white text-[17px] font-extrabold text-brand-dark"><NavPlay size={20} />Mulai murajaah</button>}
      </section>

      <div id="rate" className="space-y-3">
        {due.slice(0, 1).map((it) => (
          <div key={it.id} className="space-y-3 rounded-[28px] bg-brand-light p-4">
            <div>
              <p className="text-xl font-extrabold text-outline">{it.surah_name}</p>
              <p className="text-sm font-semibold text-muted">Jatuh tempo: {it.due_date}</p>
            </div>
            <p className="text-sm font-bold text-outline">Seberapa kuat hafalanmu?</p>
            <div className="grid grid-cols-3 gap-2">
              {RATINGS.map((r) => (
                <button key={r.id} type="button" className={`min-h-[56px] rounded-[22px] px-2 text-base font-extrabold ${r.cls}`} onClick={() => complete(it.id, r.id)}>
                  {r.label}
                  <span className="block text-[11px] font-semibold opacity-90">{r.hint}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {tiles.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {tiles.map((n) => {
            const isDue = dueNames.has(n.name_id);
            const growing = n.status === "in_progress" && !isDue;
            return (
              <div key={n.surah_id} className={`flex flex-col items-center gap-1 rounded-[28px] p-3 ${isDue ? "border-2 border-gold bg-cream" : growing ? "bg-[#6C63C9]" : "bg-teal"}`}>
                <Tree tone={isDue ? "#F2B01E" : growing ? "#E6E4F8" : "#6FCFC1"} />
                <p className={`text-base font-extrabold ${isDue ? "text-gold-ink" : "text-white"}`}>{surahName(n.surah_id, n.name_id)}</p>
                <p className={`text-[13px] font-extrabold ${isDue ? "text-[#7A5200]" : "text-white"}`}>{isDue ? "Perlu disiram" : growing ? "Sedang tumbuh" : "Sudah dihafal"}</p>
                <span className={`rounded-pill px-2.5 py-0.5 text-xs font-extrabold ${isDue ? "bg-white text-[#7A5200]" : growing ? "bg-lav text-brand-dark" : "bg-[#D9F0EC] text-[#0A4F4A]"}`}>{isDue ? "Murajaah, hari ini" : growing ? "Hafalan baru" : "Tersimpan"}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
