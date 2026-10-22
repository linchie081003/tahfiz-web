import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../lib/api";
import { surahName } from "../../lib/surahInfo";
import { AYAH_PER_PAGE, TOTAL_PAGES, loadTilawah, pagesRead, setTarget, streak, weekDots, type TilawahState } from "../../lib/tilawahProgress";
import { Page, ScreenHead } from "../../components/ui/ui";

type Surah = { id: number; ayah_count: number; juz_number: number };
const TARGETS = [1, 2, 3, 5];
const QARI = "Al-Husary, murattal";

/** Orang tua: Tilawah saya (menuju khatam, target harian, terakhir dibaca). */
export function OrtuTilawahPage() {
  const [st, setSt] = useState<TilawahState>(() => loadTilawah(2));
  useEffect(() => { const f = () => setSt(loadTilawah(2)); window.addEventListener("hafiz_tilawah_changed", f); return () => window.removeEventListener("hafiz_tilawah_changed", f); }, []);
  const surahs = useQuery({ queryKey: ["quran", "surahs", "all"], queryFn: () => api<Surah[]>("/quran/surahs") });
  const list = surahs.data ?? [];
  const offset = (id: number) => list.filter((s) => s.id < id).reduce((a, s) => a + s.ayah_count, 0);
  const max = st.max ?? 0;
  const page = Math.min(TOTAL_PAGES, Math.max(1, Math.ceil(max / AYAH_PER_PAGE)));
  const juz = Math.min(30, Math.ceil(page / 20.1)) || 1;
  const today = pagesRead(st);
  const pct = Math.min(100, Math.round((today / st.target) * 100));
  const perDay = Math.max(0.1, st.target);
  const months = Math.max(1, Math.round((TOTAL_PAGES - page) / perDay / 30));
  const dots = weekDots(st);
  const run = streak(st);
  const lastS = st.last ? list.find((s) => s.id === st.last!.surah) : undefined;
  void offset;
  return (
    <Page>
      <ScreenHead to="/" eyebrow="Area orang tua" title="Tilawah saya" back={false} />
      <section className="rounded-[28px] bg-brand p-5 text-white">
        <p className="font-extrabold opacity-90">Menuju khatam</p>
        <p className="text-3xl font-extrabold">Juz {juz} dari 30</p>
        <div className="mt-2 h-3 overflow-hidden rounded-pill bg-white/30" role="progressbar" aria-valuenow={page} aria-valuemin={0} aria-valuemax={TOTAL_PAGES} aria-label="Kemajuan khatam"><div className="h-full rounded-pill bg-gold" style={{ width: `${(page / TOTAL_PAGES) * 100}%` }} /></div>
        <p className="mt-2 text-sm font-bold">Halaman {page} dari {TOTAL_PAGES}</p>
        <p className="text-sm font-bold opacity-90">Perkiraan khatam: {months} bulan</p>
      </section>

      <section className="rounded-[28px] bg-brand-light p-5">
        <div className="flex items-baseline justify-between"><p className="font-extrabold text-outline">Target hari ini</p><p className="font-extrabold text-brand">{Math.min(st.target, Math.floor(today * 10) / 10).toString().replace(".", ",")} dari {st.target} halaman</p></div>
        <div className="mt-2 h-3 overflow-hidden rounded-pill bg-lav" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Target hari ini"><div className="h-full rounded-pill bg-teal" style={{ width: `${pct}%` }} /></div>
        <div className="mt-3 flex justify-between">
          {dots.map((d) => (
            <div key={d.label} className="flex flex-col items-center gap-1 text-xs font-extrabold text-muted">
              <span className={`flex h-8 w-8 items-center justify-center rounded-full ${d.done ? "bg-teal text-white" : d.today ? "border-2 border-brand text-brand" : "bg-lav"}`}>{d.done ? "✓" : ""}</span>{d.label}
            </div>
          ))}
        </div>
        <label className="mt-4 block text-sm font-extrabold text-outline" htmlFor="tgt">Ubah target harian</label>
        <select id="tgt" value={st.target} onChange={(e) => { setTarget(Number(e.target.value)); setSt(loadTilawah(2)); }} className="mt-1 min-h-[52px] w-full rounded-pill border-[3px] border-line bg-white px-4 font-bold">
          {TARGETS.map((n) => <option key={n} value={n}>{n} halaman</option>)}
        </select>
      </section>

      <section className="rounded-[28px] bg-brand-light p-5">
        <p className="font-extrabold text-outline">Terakhir dibaca</p>
        {st.last ? (
          <>
            <p className="text-xl font-extrabold text-brand-dark">{surahName(st.last.surah, "Surat")}, ayat {st.last.ayah}</p>
            <p className="text-sm font-semibold text-muted">{lastS ? `Juz ${lastS.juz_number}` : ""}</p>
          </>
        ) : <p className="text-sm font-semibold text-muted">Belum ada bacaan. Mulai dari Al-Fatihah.</p>}
        <Link to={st.last ? `/quran/${st.last.surah}?ayat=${st.last.ayah}` : "/quran/1"} className="mt-3 flex min-h-[56px] items-center justify-center rounded-pill bg-brand text-lg font-extrabold text-white">{st.last ? "Lanjutkan" : "Mulai membaca"}</Link>
        <p className="mt-2 text-center text-sm font-semibold text-muted">Qari: {QARI}</p>
        <Link to="/quran/daftar" className="mt-1 block text-center text-sm font-extrabold text-brand">Pilih surat lain</Link>
      </section>

      <section className="rounded-[28px] bg-cream p-5">
        <p className="font-extrabold text-outline">Tilawah bersama anak</p>
        <p className="text-sm font-semibold text-muted">{run > 0 ? `Baca bergantian, ${run} hari berturut-turut` : "Baca bergantian dengan anak. Mulai hari ini."}</p>
      </section>
    </Page>
  );
}
