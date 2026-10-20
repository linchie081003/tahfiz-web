import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { GameButton } from "./game/GameButton";
import { friendlyError, useGameToast } from "./game/GameToast";
import { api } from "../lib/api";
import { disablePush, enablePush, getPushState, type PushState } from "../lib/push";

const STATE_TEXT: Record<PushState, string> = {
  unsupported: "Perangkat/browser ini belum mendukung notifikasi. Di iPhone, tambahkan Hafiz ke Layar Utama dulu.",
  denied: "Notifikasi diblokir. Buka pengaturan browser untuk mengizinkannya.",
  unavailable: "Pengingat belum diaktifkan oleh server.",
  off: "Pengingat belum aktif di perangkat ini.",
  on: "Pengingat aktif di perangkat ini.",
};

export function RemindersAndAiSection({ isParent, reminderHour }: { isParent: boolean; reminderHour?: number }) {
  const toast = useGameToast();
  const qc = useQueryClient();
  const [state, setState] = useState<PushState>("off");
  const [busy, setBusy] = useState(false);
  const [hour, setHour] = useState(reminderHour ?? 17);
  useEffect(() => {
    void getPushState().then(setState);
  }, []);
  useEffect(() => {
    if (reminderHour != null) setHour(reminderHour);
  }, [reminderHour]);

  const consent = useQuery({
    queryKey: ["ai-consent"],
    queryFn: () => api<{ granted: boolean; available: boolean }>("/settings/ai-consent"),
    enabled: isParent,
    retry: false,
  });

  const togglePush = async () => {
    setBusy(true);
    try {
      if (state === "on") await disablePush();
      else await enablePush();
      setState(await getPushState());
      toast(state === "on" ? "Pengingat dimatikan di perangkat ini." : "Pengingat aktif!", "success");
    } catch (e) {
      toast(friendlyError(e), "error");
    } finally {
      setBusy(false);
    }
  };

  const saveHour = async (h: number) => {
    setHour(h);
    try {
      await api("/settings/family", { method: "PATCH", body: JSON.stringify({ reminder_hour: h }) });
      await qc.invalidateQueries({ queryKey: ["settings"] });
      toast("Jam pengingat tersimpan.", "success");
    } catch (e) {
      toast(friendlyError(e), "error");
    }
  };

  const setConsent = async (granted: boolean) => {
    try {
      await api("/settings/ai-consent", { method: "PUT", body: JSON.stringify({ granted }) });
      await qc.invalidateQueries({ queryKey: ["ai-consent"] });
      toast(granted ? "Pra-cek AI diizinkan." : "Izin pra-cek AI dicabut.", "success");
    } catch (e) {
      toast(friendlyError(e), "error");
    }
  };

  const canToggle = state === "on" || state === "off";
  return (
    <>
      <hr />
      <h2 className="font-bold text-purple-800">Pengingat murojaah</h2>
      <p className="text-xs text-gray-600">{STATE_TEXT[state]}</p>
      {canToggle && (
        <GameButton size="md" variant={state === "on" ? "gold" : "primary"} disabled={busy} onClick={() => void togglePush()}>
          {state === "on" ? "Matikan pengingat" : "Aktifkan pengingat"}
        </GameButton>
      )}
      {isParent && (
        <>
          <label className="block text-sm font-semibold" htmlFor="reminder-hour">
            Jam pengingat harian (untuk semua anak)
          </label>
          <select
            id="reminder-hour"
            value={hour}
            onChange={(e) => void saveHour(Number(e.target.value))}
            className="w-full rounded-game border-2 border-outline/30 p-2 font-semibold"
          >
            {Array.from({ length: 17 }, (_, i) => i + 6).map((h) => (
              <option key={h} value={h}>
                {String(h).padStart(2, "0")}.00
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-600">Pengingat hanya dikirim bila ada murojaah yang jatuh tempo.</p>

          <hr />
          <h2 className="font-bold text-purple-800">Pra-cek AI (opsional)</h2>
          {consent.data?.available ? (
            <>
              <p className="text-xs text-gray-600">
                Bila diizinkan, rekaman setoran anak dikirim ke layanan transkripsi pihak ketiga untuk membantu pra-cek.
                Hasilnya hanya saran; keputusan tetap pada orang tua. Izin dapat dicabut kapan saja.
              </p>
              <label className="flex items-center gap-2 text-sm font-bold">
                <input
                  type="checkbox"
                  checked={!!consent.data?.granted}
                  onChange={(e) => void setConsent(e.target.checked)}
                  className="h-5 w-5"
                />
                Izinkan pengiriman suara anak untuk pra-cek
              </label>
            </>
          ) : (
            <p className="text-xs text-gray-600">Pra-cek AI belum diaktifkan di server. Penilaian tetap oleh orang tua.</p>
          )}
        </>
      )}
    </>
  );
}
