import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { api } from "../lib/api";
import { Page, ScreenHead } from "../components/ui/ui";
import { LAST_SURAH_KEY } from "./QuranSurahPage";

type Surah = { id: number; name_ar: string; name_id: string; ayah_count: number; juz_number: number };

/** Tab Tilawah membuka surat terakhir dibaca (bawaan Al-Fatihah). */
export function QuranHome() {
  let last = "1";
  try { last = localStorage.getItem(LAST_SURAH_KEY) || "1"; } catch { /* abaikan */ }
  return <Navigate to={`/quran/${last}`} replace />;
}

/** Daftar 114 surat. */
export function QuranPage() {
  const [juz, setJuz] = useState<number | "all">("all");
  const [q, setQ] = useState("");
  useParams();
  const surahs = useQuery({ queryKey: ["quran", "surahs", juz], queryFn: () => api<Surah[]>(`/quran/surahs${juz === "all" ? "" : `?juz=${juz}`}`) });
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const list = surahs.data ?? [];
    return needle ? list.filter((s) => s.name_id.toLowerCase().includes(needle) || s.name_ar.includes(q.trim()) || String(s.id) === needle) : list;
  }, [surahs.data, q]);
  return (
    <Page>
      <ScreenHead to="/quran" eyebrow="Tilawah" title="Pilih surat" />
      <input type="search" aria-label="Cari surat" placeholder="Nama surat atau nomor…" value={q} onChange={(e) => setQ(e.target.value)} className="min-h-[56px] w-full rounded-pill border-[3px] border-line px-5 text-lg font-bold outline-none focus:border-brand" />
      <select aria-label="Juz" value={juz === "all" ? "" : String(juz)} onChange={(e) => setJuz(e.target.value ? Number(e.target.value) : "all")} className="min-h-[52px] w-full rounded-pill border-[3px] border-line bg-white px-4 font-bold">
        <option value="">Semua juz</option>
        {Array.from({ length: 30 }, (_, i) => i + 1).map((n) => <option key={n} value={n}>Juz {n}</option>)}
      </select>
      {surahs.isLoading && <p className="text-center font-bold text-muted">Memuat daftar surat…</p>}
      {surahs.isError && <p className="rounded-2xl bg-cream p-3 font-bold">Gagal memuat surat.</p>}
      <ul className="space-y-2">
        {filtered.map((s) => (
          <li key={s.id}>
            <Link to={`/quran/${s.id}`} className="flex min-h-[64px] items-center gap-3 rounded-[24px] bg-brand-light px-4 py-2">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand text-lg font-extrabold text-white">{s.id}</span>
              <span className="min-w-0 flex-1"><span className="block text-lg font-extrabold text-outline">{s.name_id}</span><span className="block text-sm font-semibold text-muted">{s.ayah_count} ayat · Juz {s.juz_number}</span></span>
              <span className="font-quran text-2xl text-brand" dir="rtl" lang="ar">{s.name_ar}</span>
            </Link>
          </li>
        ))}
      </ul>
    </Page>
  );
}
