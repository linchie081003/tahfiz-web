import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "../lib/api";
import { friendlyError, useGameToast } from "./game/GameToast";

type MS = { coverage: string; daily_ayahs: number; murajaah_strong_days: number; set_by: string };

/** Pengaturan belajar per anak: cakupan, kecepatan hafalan, interval murajaah Kuat. */
export function MemberLearningSettings({ memberId, name }: { memberId: string; name?: string | null }) {
  const qc = useQueryClient();
  const toast = useGameToast();
  const [busy, setBusy] = useState(false);
  const { data } = useQuery({
    queryKey: ["member-settings", memberId],
    queryFn: () => api<MS>(`/members/${memberId}/settings`),
  });
  if (!data) return null;

  const update = async (patch: Partial<Omit<MS, "set_by">>) => {
    setBusy(true);
    try {
      await api(`/members/${memberId}/settings`, { method: "PUT", body: JSON.stringify(patch) });
      await qc.invalidateQueries({ queryKey: ["member-settings", memberId] });
      await qc.invalidateQueries({ queryKey: ["home"] });
      await qc.invalidateQueries({ queryKey: ["murojaah"] });
    } catch (e) {
      toast(friendlyError(e), "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <h2 className="font-bold text-purple-800">Belajar {name ?? "anak"}</h2>
      <p className="text-xs text-gray-600">Berlaku untuk profil anak ini saja. Kedua orang tua boleh mengubahnya.</p>
      <label className="block text-sm font-semibold" htmlFor="cakupan">Cakupan hafalan</label>
      <select id="cakupan" className="w-full rounded-xl border p-2" disabled={busy} value={data.coverage}
        onChange={(e) => void update({ coverage: e.target.value })}>
        <option value="juz30">Juz 30</option>
        <option value="all">Seluruh 114 surat</option>
      </select>
      <label className="block text-sm font-semibold" htmlFor="kecepatan">Kecepatan hafalan baru</label>
      <select id="kecepatan" className="w-full rounded-xl border p-2" disabled={busy} value={data.daily_ayahs}
        onChange={(e) => void update({ daily_ayahs: Number(e.target.value) })}>
        {[1, 2, 3, 5].map((n) => (
          <option key={n} value={n}>{n} ayat per hari{n === 1 ? " (disarankan)" : ""}</option>
        ))}
      </select>
      <label className="block text-sm font-semibold" htmlFor="kuat">Murajaah hafalan yang kuat diulang tiap</label>
      <select id="kuat" className="w-full rounded-xl border p-2" disabled={busy} value={data.murajaah_strong_days}
        onChange={(e) => void update({ murajaah_strong_days: Number(e.target.value) })}>
        <option value={14}>14 hari (disarankan)</option>
        <option value={7}>7 hari</option>
      </select>
      <p className="text-xs text-gray-600">Hafalan yang cukup kuat diulang 7 hari; yang lemah diulang besok.</p>
    </>
  );
}
