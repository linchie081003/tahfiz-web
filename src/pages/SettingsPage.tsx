import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { FALLBACK_RECITERS, filterRecitersForGender, type ReciterOption } from "../lib/reciters";
import { LogoutButton } from "../components/LogoutButton";
import { TajweedLegend } from "../components/TajweedLegend";
import { loadQuranPrefs, saveQuranPrefs, type QuranPrefs } from "../lib/quranPrefs";

type Settings = {
  daily_ziyadah_ayahs: number;
  daily_murojaah_cap: number;
  reciter_id?: string;
  playback_speed?: number;
  arabic_font_size?: string;
  show_tajweed_colors?: boolean;
};

export function SettingsPage() {
  const qc = useQueryClient();
  const [prefs, setPrefs] = useState<QuranPrefs>(() => loadQuranPrefs());
  const { data: settings } = useQuery({
    queryKey: ["settings"],
    queryFn: () => api<Settings>("/settings/family"),
    retry: false,
  });
  const { data: allReciters, isError, isLoading } = useQuery({
    queryKey: ["reciters", "all"],
    queryFn: () => api<ReciterOption[]>("/quran/reciters"),
    staleTime: 60_000,
  });

  const reciterCatalog = useMemo(() => {
    if (allReciters?.length) return allReciters;
    if (isError) return FALLBACK_RECITERS;
    return [];
  }, [allReciters, isError]);

  const displayReciters = useMemo(
    () => filterRecitersForGender(reciterCatalog, prefs.voiceGender),
    [reciterCatalog, prefs.voiceGender],
  );

  const noFemaleReciters =
    prefs.voiceGender === "female" && reciterCatalog.length > 0 && !reciterCatalog.some((r) => r.gender === "female");

  useEffect(() => {
    if (settings?.reciter_id) {
      setPrefs((p) => ({ ...p, reciterId: settings.reciter_id! }));
    }
  }, [settings?.reciter_id]);

  useEffect(() => {
    if (!displayReciters.length) return;
    if (displayReciters.some((r) => r.id === prefs.reciterId)) return;
    setPrefs((p) => {
      const next = { ...p, reciterId: displayReciters[0].id };
      saveQuranPrefs(next);
      return next;
    });
  }, [displayReciters, prefs.reciterId]);

  const persist = async (next: QuranPrefs) => {
    setPrefs(next);
    saveQuranPrefs(next);
    try {
      await api("/settings/family", {
        method: "PATCH",
        body: JSON.stringify({
          reciter_id: next.reciterId,
          playback_speed: next.playbackSpeed,
          arabic_font_size: next.arabicFontSize,
          show_tajweed_colors: next.showTajweed,
        }),
      });
      qc.invalidateQueries({ queryKey: ["ayahs"] });
      qc.invalidateQueries({ queryKey: ["tahsin"] });
    } catch {
      /* orang tua saja — prefs lokal tetap dipakai */
    }
  };

  const selectedReciter = displayReciters.find((r) => r.id === prefs.reciterId);

  return (
    <div className="space-y-4 p-4">
      <Link to="/" className="text-white underline">
        ← Home
      </Link>
      <h1 className="text-2xl font-bold">Pengaturan</h1>

      <div className="card-surface space-y-4 p-4 text-gray-800">
        <h2 className="font-bold text-purple-800">Suara (Qari)</h2>
        <label className="block text-sm font-semibold">Jenis suara</label>
        <select
          className="w-full rounded-xl border p-2"
          value={prefs.voiceGender}
          onChange={(e) => {
            const voiceGender = e.target.value as QuranPrefs["voiceGender"];
            void persist({ ...prefs, voiceGender });
          }}
        >
          <option value="all">Semua</option>
          <option value="male">Laki-laki</option>
          <option value="female">Perempuan</option>
        </select>
        {noFemaleReciters && (
          <p className="text-xs text-amber-800">
            Qori perempuan belum tersedia di sumber audio EveryAyah. Daftar di bawah menampilkan qori laki-laki yang
            tersedia.
          </p>
        )}

        <label className="block text-sm font-semibold">Pilihan qari</label>
        <select
          className="w-full rounded-xl border p-2"
          value={displayReciters.some((r) => r.id === prefs.reciterId) ? prefs.reciterId : ""}
          disabled={!displayReciters.length && isLoading}
          onChange={(e) => void persist({ ...prefs, reciterId: e.target.value })}
        >
          {isLoading && !displayReciters.length && <option value="">Memuat daftar qori…</option>}
          {displayReciters.map((r) => (
            <option key={r.id} value={r.id}>
              {r.label} ({r.gender === "female" ? "Perempuan" : "Laki-laki"})
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-600">{selectedReciter?.description ?? "Pilih qori untuk audio Ziyadah & Tahsin."}</p>

        <label className="block text-sm font-semibold">Kecepatan audio ({prefs.playbackSpeed}x)</label>
        <input
          type="range"
          min={0.5}
          max={1}
          step={0.1}
          value={prefs.playbackSpeed}
          onChange={(e) => void persist({ ...prefs, playbackSpeed: Number(e.target.value) })}
          className="w-full"
        />

        <h2 className="pt-2 font-bold text-purple-800">Tampilan Arab</h2>
        <label className="block text-sm font-semibold">Ukuran huruf</label>
        <select
          className="w-full rounded-xl border p-2"
          value={prefs.arabicFontSize}
          onChange={(e) =>
            void persist({ ...prefs, arabicFontSize: e.target.value as QuranPrefs["arabicFontSize"] })
          }
        >
          <option value="medium">Sedang</option>
          <option value="large">Besar (disarankan)</option>
          <option value="xlarge">Sangat besar</option>
        </select>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={prefs.showTajweed}
            onChange={(e) => void persist({ ...prefs, showTajweed: e.target.checked })}
          />
          Tampilkan teks tajwid (warna hukum bacaan, jika tersedia)
        </label>
        <TajweedLegend tone="light" defaultOpen />
        <p className="text-xs text-gray-600">
          Font <strong>Amiri Quran</strong> + harakat lengkap dari Quran.com. Jalankan{" "}
          <code className="rounded bg-gray-100 px-1">python scripts/enrich_ayahs_quran_com.py</code> jika ayat masih
          terpotong atau tanpa warna.
        </p>

        <hr />
        <p>Target ziyadah harian: {settings?.daily_ziyadah_ayahs ?? 3} ayat</p>
        <p>Batas murojaah: {settings?.daily_murojaah_cap ?? 5}</p>

        <hr />
        <h2 className="font-bold text-purple-800">Akun</h2>
        <p className="text-sm text-gray-600">Keluar dari perangkat ini. Login lagi dengan email/kode anak.</p>
        <LogoutButton className="w-full rounded-2xl border-2 border-red-200 bg-red-50 py-3 font-bold text-red-700" />
      </div>
    </div>
  );
}
