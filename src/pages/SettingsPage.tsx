import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { friendlyError, useGameToast } from "../components/game/GameToast";
import { useAgeMode, setAgeMode, type AgeMode } from "../context/AgeModeContext";
import { AgeModeSelect } from "../components/AgeModeSelect";
import { ageModeLabel } from "../lib/ageModeOptions";
import { syncReciterToAgeMode } from "../lib/reciterPolicy";
import { filterRecitersForAge } from "../lib/reciterPolicy";
import { FALLBACK_RECITERS, filterRecitersForGender, type ReciterOption } from "../lib/reciters";
import { TajweedLegend } from "../components/TajweedLegend";
import { LogoutButton } from "../components/LogoutButton";
import { FamilyParents } from "../components/FamilyParents";
import { MemberLearningSettings } from "../components/MemberLearningSettings";
import { RemindersAndAiSection } from "../components/RemindersAndAiSection";
import { Page, ScreenHead } from "../components/ui/ui";
import { loadQuranPrefs, saveQuranPrefs, type QuranPrefs } from "../lib/quranPrefs";

type Settings = {
  daily_ziyadah_ayahs: number;
  daily_murojaah_cap: number;
  reminder_hour?: number;
  reciter_id?: string;
  playback_speed?: number;
  arabic_font_size?: string;
  show_tajweed_colors?: boolean;
};

export function SettingsPage() {
  const qc = useQueryClient();
  const toast = useGameToast();
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
      toast(friendlyError(e), "error");
    } finally {
      setMissionBusy(false);
    }
  };

  const applyAgeMode = async (next: AgeMode) => {
    if (isChild) {
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
    } catch (e) {
      toast(friendlyError(e), "error");
    } finally {
      setAgeBusy(false);
    }
  };

  useEffect(() => {
    if (!session.data) return;
  }, [session.data?.role, session.data?.member_id, session.data?.age_mode]);

  return (
    <Page>
      <ScreenHead to={isParent ? "/parent/pengaturan" : "/"} eyebrow={isParent ? "Area orang tua" : undefined} title="Pengaturan belajar" sub="Qari, tajwid, dan tampilan Arab berlaku untuk profil yang sedang aktif." />

      <div className="space-y-4 [&_h2]:text-lg [&_h2]:font-extrabold [&_h2]:text-brand-dark [&_label]:text-sm [&_label]:font-extrabold [&_label]:text-outline [&_hr]:hidden [&_section]:rounded-[28px] [&_section]:bg-brand-light [&_section]:p-5 [&_section]:space-y-3">
      <section>
        <h2>Mode usia</h2>
        {isChild ? (
          <p className="text-sm font-semibold text-muted">
            Mode saat ini: <strong>{ageModeLabel(sessionAge)}</strong>. Qari dan tampilan mengikuti mode ini. Minta orang tua
            mengubah mode usia jika perlu.
          </p>
        ) : (
          <>
            {isParent && !activeMemberId && (
              <p className="text-sm font-semibold text-muted">
                Anda belajar sebagai orang tua tanpa profil anak. Mode ini hanya untuk tampilan &amp; qari di perangkat ini.
                Untuk mengubah mode anak, buka{" "}
                <Link to="/pilih-profil" className="font-bold text-brand underline">Kelola profil</Link>.
              </p>
            )}
            {isParent && activeMemberId && session.data?.member_name && (
              <p className="text-sm font-semibold text-muted">
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
              className="min-h-[52px] w-full rounded-pill border-[3px] border-line bg-white px-4 font-bold text-outline outline-none focus:border-brand"
              onChange={(next) => void applyAgeMode(next)}
            />
            <p className="text-sm font-semibold text-muted">
              PAUD/SD: qari Muallim (Husary) disarankan; remaja/dewasa: murattal. Mujawwad hanya hadiah setelah lulus setoran.
            </p>
          </>
        )}

      </section>

      <section>
        <h2>Suara (Qari)</h2>
        <p className="text-sm font-semibold text-muted">
          Mode usia aktif: <strong>{ageModeLabel(ageMode)}</strong>
        </p>
        <label className="block text-sm font-semibold">Jenis suara</label>
        <select
          className="min-h-[52px] w-full truncate rounded-pill border-[3px] border-line bg-white px-4 font-bold text-outline outline-none focus:border-brand"
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
          <p className="text-sm font-bold text-gold-ink">
            Qori perempuan belum tersedia di sumber audio EveryAyah. Daftar di bawah menampilkan qori laki-laki yang
            tersedia.
          </p>
        )}

        <label className="block text-sm font-semibold">Pilihan qari</label>
        <select
          className="min-h-[52px] w-full truncate rounded-pill border-[3px] border-line bg-white px-4 font-bold text-outline outline-none focus:border-brand"
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
        <p className="text-sm font-semibold text-muted">{selectedReciter?.description ?? "Pilih qori untuk audio Ziyadah & Tahsin."}</p>

        <label className="block text-sm font-semibold">Kecepatan audio ({prefs.playbackSpeed}x)</label>
        <input
          type="range"
          min={0.5}
          max={1}
          step={0.1}
          value={prefs.playbackSpeed}
          onChange={(e) => void persist({ ...prefs, playbackSpeed: Number(e.target.value) })}
          className="w-full accent-brand"
        />

      </section>

      <section>
        <h2>Tampilan Arab</h2>
        <label className="block text-sm font-semibold">Ukuran huruf</label>
        <select
          className="min-h-[52px] w-full truncate rounded-pill border-[3px] border-line bg-white px-4 font-bold text-outline outline-none focus:border-brand"
          value={prefs.arabicFontSize}
          onChange={(e) =>
            void persist({ ...prefs, arabicFontSize: e.target.value as QuranPrefs["arabicFontSize"] })
          }
        >
          <option value="medium">Sedang</option>
          <option value="large">Besar (disarankan)</option>
          <option value="xlarge">Sangat besar</option>
        </select>

        <label className="flex min-h-[44px] items-center gap-3 text-sm font-bold">
          <input
            type="checkbox" className="h-5 w-5 accent-brand"
            checked={prefs.showTajweed}
            onChange={(e) => void persist({ ...prefs, showTajweed: e.target.checked })}
          />
          Tampilkan teks tajwid (warna hukum bacaan, jika tersedia)
        </label>
        <TajweedLegend tone="light" defaultOpen />

      </section>

      <section>
        <RemindersAndAiSection isParent={isParent} reminderHour={settings?.reminder_hour} />
      </section>

        {isParent && (
          <>
            {activeMemberId && <MemberLearningSettings memberId={activeMemberId} name={session.data?.member_name} />}
            <section><FamilyParents /></section>
            <section>
            <h2>Batas murajaah harian (keluarga)</h2>
            <p className="text-sm font-semibold text-muted">
              Berlaku untuk semua profil anak. Kecepatan hafalan baru diatur per anak di bagian "Belajar".
            </p>
            <label className="block text-sm font-semibold" htmlFor="murojaah-cap">
              Batas murojaah per hari (item)
            </label>
            <input
              id="murojaah-cap"
              type="number"
              min={1}
              max={30}
              disabled={missionBusy}
              className="min-h-[52px] w-full rounded-pill border-[3px] border-line bg-white px-4 font-bold outline-none focus:border-brand"
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
            </section>
          </>
        )}

        <LogoutButton label="Keluar" className="flex min-h-[56px] w-full items-center justify-center rounded-pill border-[3px] border-brand bg-white text-lg font-extrabold text-brand-dark" />
      </div>
    </Page>
  );
}
