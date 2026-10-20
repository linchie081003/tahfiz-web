import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { useAgeMode, setAgeMode, type AgeMode } from "../context/AgeModeContext";
import { AgeModeSelect } from "../components/AgeModeSelect";
import { ageModeLabel } from "../lib/ageModeOptions";
import { syncReciterToAgeMode } from "../lib/reciterPolicy";
import { filterRecitersForAge } from "../lib/reciterPolicy";
import { FALLBACK_RECITERS, filterRecitersForGender, type ReciterOption } from "../lib/reciters";
import { TajweedLegend } from "../components/TajweedLegend";
import { AppPage, PageTitleRow } from "../components/layout/AppPage";
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
  const { mode: ageMode } = useAgeMode();
  const session = useQuery({
    queryKey: ["session"],
    queryFn: () =>
      api<{ role: string; member_id?: string | null; member_name?: string | null; age_mode?: string | null }>(
        "/auth/session",
      ),
  });
  const isParent = session.data?.role === "parent";
  const isChild = session.data?.role === "child";
  const activeMemberId = session.data?.member_id ?? null;
  const [ageBusy, setAgeBusy] = useState(false);
  const [missionBusy, setMissionBusy] = useState(false);
  const [prefs, setPrefs] = useState<QuranPrefs>(() => loadQuranPrefs());
  const { data: settings } = useQuery({
    queryKey: ["settings"],
    queryFn: () => api<Settings>("/settings/family"),
    retry: false,
    enabled: isParent,
  });
  const [ziyadahTarget, setZiyadahTarget] = useState(3);
  const [murojaahCap, setMurojaahCap] = useState(5);

  useEffect(() => {
    if (settings) {
      setZiyadahTarget(settings.daily_ziyadah_ayahs);
      setMurojaahCap(settings.daily_murojaah_cap);
    }
  }, [settings?.daily_ziyadah_ayahs, settings?.daily_murojaah_cap]);
  const { data: allReciters, isError, isLoading } = useQuery({
    queryKey: ["reciters", "all", ageMode],
    queryFn: () => api<ReciterOption[]>(`/quran/reciters?age_mode=${ageMode}`),
    staleTime: 60_000,
  });

  const reciterCatalog = useMemo(() => {
    if (allReciters?.length) return allReciters;
    if (isError) return FALLBACK_RECITERS;
    return [];
  }, [allReciters, isError]);

  const displayReciters = useMemo(() => {
    const byAge = filterRecitersForAge(reciterCatalog, ageMode);
    return filterRecitersForGender(byAge, prefs.voiceGender);
  }, [reciterCatalog, prefs.voiceGender, ageMode]);

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

  const sessionAge =
    session.data?.age_mode === "paud" ||
    session.data?.age_mode === "sd" ||
    session.data?.age_mode === "teen" ||
    session.data?.age_mode === "adult"
      ? (session.data.age_mode as AgeMode)
      : ageMode;

  const saveMissionTargets = async (daily_ziyadah_ayahs: number, daily_murojaah_cap: number) => {
    if (!isParent) return;
    setMissionBusy(true);
    try {
      await api("/settings/family", {
        method: "PATCH",
        body: JSON.stringify({ daily_ziyadah_ayahs, daily_murojaah_cap }),
      });
      await qc.invalidateQueries({ queryKey: ["settings"] });
      await qc.invalidateQueries({ queryKey: ["home"] });
      await qc.invalidateQueries({ queryKey: ["murojaah"] });
    } catch (e) {
      alert(String(e));
    } finally {
      setMissionBusy(false);
    }
  };

  const applyAgeMode = async (next: AgeMode) => {
    // #region agent log
    fetch("http://127.0.0.1:7462/ingest/a9bfa8ed-ff6b-477f-819e-b77f5ba5b1a7", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "70ed62" },
      body: JSON.stringify({
        sessionId: "70ed62",
        hypothesisId: "A",
        location: "SettingsPage.tsx:applyAgeMode:entry",
        message: "applyAgeMode called",
        data: { isChild, isParent, activeMemberId, next, sessionRole: session.data?.role ?? null },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
    if (isChild) {
      // #region agent log
      fetch("http://127.0.0.1:7462/ingest/a9bfa8ed-ff6b-477f-819e-b77f5ba5b1a7", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "70ed62" },
        body: JSON.stringify({
          sessionId: "70ed62",
          hypothesisId: "B",
          location: "SettingsPage.tsx:applyAgeMode:child-blocked",
          message: "Child session — skip PATCH age_mode",
          data: { next },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion
      return;
    }
    setAgeBusy(true);
    try {
      if (isParent && activeMemberId) {
        await api(`/members/${activeMemberId}`, { method: "PATCH", body: JSON.stringify({ age_mode: next }) });
      } else {
        setAgeMode(next);
        syncReciterToAgeMode(next);
      }
      setAgeMode(next);
      syncReciterToAgeMode(next);
      await qc.invalidateQueries({ queryKey: ["session"] });
      await qc.invalidateQueries({ queryKey: ["reciters"] });
      await qc.invalidateQueries({ queryKey: ["home"] });
      // #region agent log
      fetch("http://127.0.0.1:7462/ingest/a9bfa8ed-ff6b-477f-819e-b77f5ba5b1a7", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "70ed62" },
        body: JSON.stringify({
          sessionId: "70ed62",
          hypothesisId: "C",
          location: "SettingsPage.tsx:applyAgeMode:success",
          message: "Age mode saved",
          data: { next, hadMemberId: Boolean(activeMemberId) },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion
    } catch (e) {
      // #region agent log
      fetch("http://127.0.0.1:7462/ingest/a9bfa8ed-ff6b-477f-819e-b77f5ba5b1a7", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "70ed62" },
        body: JSON.stringify({
          sessionId: "70ed62",
          hypothesisId: "D",
          location: "SettingsPage.tsx:applyAgeMode:error",
          message: "applyAgeMode failed",
          data: { error: String(e) },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion
      alert(String(e));
    } finally {
      setAgeBusy(false);
    }
  };

  useEffect(() => {
    if (!session.data) return;
    // #region agent log
    fetch("http://127.0.0.1:7462/ingest/a9bfa8ed-ff6b-477f-819e-b77f5ba5b1a7", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "70ed62" },
      body: JSON.stringify({
        sessionId: "70ed62",
        hypothesisId: "E",
        location: "SettingsPage.tsx:session",
        message: "Settings session loaded",
        data: {
          role: session.data.role,
          member_id: session.data.member_id ?? null,
          age_mode: session.data.age_mode ?? null,
          ageUiEditable: session.data.role !== "child",
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
  }, [session.data?.role, session.data?.member_id, session.data?.age_mode]);

  return (
    <AppPage>
      <Link to="/" className="text-white underline">
        ← Home
      </Link>
      <PageTitleRow>
        <h1 className="text-2xl font-bold">Pengaturan</h1>
      </PageTitleRow>
      <p className="text-sm text-white/90">
        Qari, tajwid, dan tampilan Arab berlaku untuk profil yang sedang aktif. Orang tua bisa memakai Tahsin, Ziyadah,
        Murojaah, dan Alquran seperti anak setelah memilih profil.
      </p>

      <div className="card-surface space-y-4 p-4 text-gray-800">
        <h2 className="font-bold text-purple-800">Mode usia</h2>
        {isChild ? (
          <p className="text-xs text-gray-600">
            Mode saat ini: <strong>{ageModeLabel(sessionAge)}</strong>. Qari dan tampilan mengikuti mode ini. Minta orang tua
            mengubah mode usia jika perlu.
          </p>
        ) : (
          <>
            {isParent && !activeMemberId && (
              <p className="text-xs text-gray-600">
                Anda belajar sebagai orang tua tanpa profil anak. Mode ini hanya untuk tampilan &amp; qari di perangkat ini.
                Untuk mengubah mode anak, buka{" "}
                <Link to="/pilih-profil" className="font-bold text-brand underline">Kelola profil</Link>.
              </p>
            )}
            {isParent && activeMemberId && session.data?.member_name && (
              <p className="text-xs text-gray-600">
                Mengatur mode untuk profil <strong>{session.data.member_name}</strong> (sedang aktif).
              </p>
            )}
            <label className="block text-sm font-semibold" htmlFor="age-mode">
              Tingkat / mode belajar
            </label>
            <AgeModeSelect
              id="age-mode"
              value={sessionAge}
              disabled={ageBusy}
              onChange={(next) => void applyAgeMode(next)}
            />
            <p className="text-xs text-gray-600">
              PAUD/SD: qari Muallim (Husary) disarankan; remaja/dewasa: murattal. Mujawwad hanya hadiah setelah lulus setoran.
            </p>
          </>
        )}

        <hr />

        <h2 className="font-bold text-purple-800">Suara (Qari)</h2>
        <p className="text-xs text-gray-600">
          Mode usia aktif: <strong>{ageModeLabel(ageMode)}</strong>
        </p>
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
              {r.label}
              {r.default_for_age ? " · disarankan" : ""} ({r.gender === "female" ? "Perempuan" : "Laki-laki"})
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

        {isParent && (
          <>
            <hr />
            <h2 className="font-bold text-purple-800">Target belajar harian (keluarga)</h2>
            <p className="text-xs text-gray-600">
              Berlaku untuk semua profil anak. Misi di Home dan daftar murojaah mengikuti angka ini.
            </p>
            <label className="block text-sm font-semibold" htmlFor="ziyadah-target">
              Target ziyadah harian (ayat)
            </label>
            <input
              id="ziyadah-target"
              type="number"
              min={1}
              max={30}
              disabled={missionBusy}
              className="w-full rounded-game border-2 border-outline/30 p-2 font-semibold"
              value={ziyadahTarget}
              onChange={(e) => setZiyadahTarget(Number(e.target.value))}
              onBlur={() => {
                const z = Math.min(30, Math.max(1, ziyadahTarget || 3));
                const m = Math.min(30, Math.max(1, murojaahCap || 5));
                setZiyadahTarget(z);
                setMurojaahCap(m);
                if (z !== settings?.daily_ziyadah_ayahs || m !== settings?.daily_murojaah_cap) {
                  void saveMissionTargets(z, m);
                }
              }}
            />
            <label className="block text-sm font-semibold" htmlFor="murojaah-cap">
              Batas murojaah per hari (item)
            </label>
            <input
              id="murojaah-cap"
              type="number"
              min={1}
              max={30}
              disabled={missionBusy}
              className="w-full rounded-game border-2 border-outline/30 p-2 font-semibold"
              value={murojaahCap}
              onChange={(e) => setMurojaahCap(Number(e.target.value))}
              onBlur={() => {
                const z = Math.min(30, Math.max(1, ziyadahTarget || 3));
                const m = Math.min(30, Math.max(1, murojaahCap || 5));
                setZiyadahTarget(z);
                setMurojaahCap(m);
                if (z !== settings?.daily_ziyadah_ayahs || m !== settings?.daily_murojaah_cap) {
                  void saveMissionTargets(z, m);
                }
              }}
            />
          </>
        )}

      </div>
    </AppPage>
  );
}
