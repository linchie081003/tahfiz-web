import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { GameHeader } from "../components/game/GameHeader";
import { AppPage } from "../components/layout/AppPage";
import { TajweedLegend } from "../components/TajweedLegend";
import { api } from "../lib/api";

type Surah = {
  id: number;
  name_ar: string;
  name_id: string;
  ayah_count: number;
  juz_number: number;
};

export function QuranPage() {
  const [juz, setJuz] = useState<number | "all">("all");
  const [q, setQ] = useState("");
  const surahs = useQuery({
    queryKey: ["quran", "surahs", juz],
    queryFn: () => api<Surah[]>(`/quran/surahs${juz === "all" ? "" : `?juz=${juz}`}`),
  });

  const filtered = useMemo(() => {
    const list = surahs.data ?? [];
    const needle = q.trim().toLowerCase();
    if (!needle) return list;
    return list.filter(
      (s) =>
        s.name_id.toLowerCase().includes(needle) ||
        s.name_ar.includes(q.trim()) ||
        String(s.id) === needle,
    );
  }, [surahs.data, q]);

  return (
    <AppPage>
      <GameHeader title="Al-Quran" to="/" />
      <p className="text-sm text-muted">114 surat · audio qori lewat ikon pengaturan kanan atas</p>

      <TajweedLegend tone="dark" />

      <div className="card-surface space-y-3 p-4">
        <label className="block text-sm font-semibold text-gray-800">Cari surat</label>
        <input
          type="search"
          className="w-full rounded-xl border p-2"
          placeholder="Nama surat atau nomor…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <label className="block text-sm font-semibold text-gray-800">Juz</label>
        <select
          className="w-full rounded-xl border p-2"
          value={juz === "all" ? "" : String(juz)}
          onChange={(e) => setJuz(e.target.value ? Number(e.target.value) : "all")}
        >
          <option value="">Semua juz</option>
          {Array.from({ length: 30 }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>
              Juz {n}
            </option>
          ))}
        </select>
      </div>

      {surahs.isLoading && <p className="text-center text-outline">Memuat daftar surat…</p>}
      {surahs.isError && (
        <p className="rounded-2xl bg-coral/15 p-4 text-sm text-outline">
          {surahs.error instanceof Error ? surahs.error.message : "Gagal memuat surat"}
        </p>
      )}

      <ul className="space-y-2">
        {filtered.map((s) => (
          <li key={s.id}>
            <Link
              to={`/quran/${s.id}`}
              className="card-surface flex items-center gap-3 p-4 transition hover:ring-2 hover:ring-purple-300"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand text-lg font-extrabold text-white">
                {s.id}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-serif text-xl text-gray-900" dir="rtl" lang="ar">
                  {s.name_ar}
                </p>
                <p className="font-bold text-gray-800">{s.name_id}</p>
                <p className="text-xs text-gray-500">
                  {s.ayah_count} ayat · Juz {s.juz_number}
                </p>
              </div>
              <span className="text-purple-700" aria-hidden>
                ›
              </span>
            </Link>
          </li>
        ))}
      </ul>
      {!surahs.isLoading && filtered.length === 0 && (
        <p className="text-center text-sm text-muted">Tidak ada surat yang cocok.</p>
      )}
    </AppPage>
  );
}
