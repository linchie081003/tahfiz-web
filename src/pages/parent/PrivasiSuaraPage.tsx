import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { api, API, downloadFile } from "../../lib/api";
import { useChild } from "../../lib/useChild";
import { Avatar, Btn, Card, Notice, Page, ScreenHead, Toggle } from "../../components/ui/ui";
import { friendlyError, useGameToast } from "../../components/game/GameToast";

type Summary = { recordings: number; size_mb: number; oldest_days: number; retention_days: number; consent: boolean; teacher: { name: string; recording_consent: boolean } | null };
type Log = { id: string; teacher: string; member: string; at: string };

function PinBox({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  return <input inputMode="numeric" type="password" maxLength={4} value={value} aria-label={label} placeholder={label} onChange={(e) => onChange(e.target.value.replace(/\D/g, ""))}
    className="min-h-[56px] w-full rounded-pill border-[3px] border-line px-5 text-center text-2xl font-extrabold tracking-[0.3em] placeholder:text-base placeholder:font-bold placeholder:tracking-normal outline-none focus:border-brand" />;
}

export function PrivasiSuaraPage() {
  const toast = useGameToast();
  const qc = useQueryClient();
  const { children, child, select } = useChild();
  const [pin, setPin] = useState("");
  const [oldPin, setOldPin] = useState("");
  const [askDelete, setAskDelete] = useState(false);
  const sum = useQuery({ queryKey: ["privacy", child?.id], enabled: !!child, queryFn: () => api<Summary>(`/family/privacy-summary?member_id=${child!.id}`) });
  const hasPin = useQuery({ queryKey: ["pin"], queryFn: () => api<{ has_pin: boolean }>("/family/pin") });
  const log = useQuery({ queryKey: ["access-log"], queryFn: () => api<Log[]>("/family/access-log"), retry: false });
  const dels = useQuery({ queryKey: ["deletions"], queryFn: () => api<{ id: string; purge_due_at: string; status: string; recording_count: number }[]>("/family/recordings/deletions") });
  const refresh = () => qc.invalidateQueries();
  const fail = (e: unknown) => toast(friendlyError(e), "error");

  const consent = useMutation({ mutationFn: (v: boolean) => api("/family/consent/recording", { method: "POST", body: JSON.stringify({ granted: v }) }), onSuccess: refresh, onError: fail });
  const savePin = useMutation({
    mutationFn: () => api("/family/pin", { method: "PUT", body: JSON.stringify({ pin, current_pin: oldPin || undefined }) }),
    onSuccess: () => { setPin(""); setOldPin(""); refresh(); toast("PIN disimpan", "success"); }, onError: fail,
  });
  const del = useMutation({
    mutationFn: () => api<{ deleted: number }>("/family/recordings/delete", { method: "POST", body: JSON.stringify({ member_id: child!.id, pin }) }),
    onSuccess: (r) => { setPin(""); setAskDelete(false); refresh(); toast(`${r.deleted} rekaman dihapus`, "success"); }, onError: fail,
  });
  const exp = useMutation({
    mutationFn: async () => {
      const r = await api<{ token: string; valid_hours: number }>("/family/export", { method: "POST", body: JSON.stringify({ member_id: child!.id }) });
      await downloadFile(`${API}/family/export/download?token=${encodeURIComponent(r.token)}`, `hafiz-${child!.name}.zip`, false);
    },
    onSuccess: () => toast("Data diunduh. Tautan berlaku 24 jam.", "success"), onError: fail,
  });
  const s = sum.data;

  return (
    <Page>
      <ScreenHead to="/parent/keluarga" eyebrow="Area orang tua" title="Privasi suara" />
      <div className="flex gap-2 overflow-x-auto">
        {children.map((c) => (
          <button key={c.id} type="button" onClick={() => select(c.id)} className={`flex shrink-0 items-center gap-2 rounded-pill px-3 py-1.5 font-extrabold ${child?.id === c.id ? "bg-brand text-white" : "bg-lav text-brand-dark"}`}>
            <Avatar name={c.name} color={c.color} size={28} />{c.name}
          </button>
        ))}
      </div>

      <Card tone="lav">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-lg font-extrabold text-outline">Simpan rekaman suara anak</p>
            <p className="text-sm font-semibold text-muted">Tanpa izin ini, suara hanya dipakai untuk pra-cek lalu tidak disimpan.</p>
          </div>
          <Toggle label="Izin menyimpan rekaman" on={!!s?.consent} onChange={(v) => consent.mutate(v)} />
        </div>
      </Card>

      {s && (
        <Card tone="mint">
          <p className="font-extrabold text-outline">Rekaman {child?.name} tersimpan</p>
          <p className="text-3xl font-extrabold text-teal">{s.recordings} <span className="text-base">rekaman · {s.size_mb} MB</span></p>
          <p className="text-sm font-semibold text-muted">Dihapus otomatis setelah {s.retention_days} hari. Tertua {s.oldest_days} hari.</p>
          {s.teacher && <p className="mt-1 text-sm font-semibold text-muted">{s.teacher.name} {s.teacher.recording_consent ? "boleh" : "tidak boleh"} mendengar rekaman.</p>}
        </Card>
      )}

      <Card tone="plain">
        <p className="mb-2 text-lg font-extrabold text-outline">PIN orang tua</p>
        <p className="mb-3 text-sm font-semibold text-muted">PIN 4 angka melindungi penghapusan rekaman.</p>
        {hasPin.data?.has_pin && <div className="mb-2"><PinBox label="PIN lama" value={oldPin} onChange={setOldPin} /></div>}
        <div className="mb-3"><PinBox label={hasPin.data?.has_pin ? "PIN baru" : "PIN"} value={pin} onChange={setPin} /></div>
        <Btn variant="soft" disabled={pin.length !== 4 || savePin.isPending} onClick={() => savePin.mutate()}>{hasPin.data?.has_pin ? "Ganti PIN" : "Buat PIN"}</Btn>
      </Card>

      <Btn variant="outline" disabled={!child || exp.isPending} onClick={() => exp.mutate()}>Unduh data {child?.name}</Btn>
      <p className="-mt-2 text-center text-xs font-semibold text-muted">Berkas ZIP berisi kemajuan, penilaian, catatan guru, dan rekaman. Tautan berlaku 24 jam.</p>

      {!askDelete ? (
        <Btn variant="danger-outline" disabled={!s || s.recordings === 0} onClick={() => { setPin(""); setAskDelete(true); }}>Hapus semua rekaman</Btn>
      ) : (
        <Card tone="cream">
          <p className="font-extrabold text-gold-ink">Hapus {s?.recordings} rekaman {child?.name}?</p>
          <p className="mb-3 text-sm font-semibold text-gold-ink">Hilang dari aplikasi sekarang, dan dihapus permanen dari penyimpanan serta cadangan dalam 7 hari. Tidak bisa dibatalkan.</p>
          {!hasPin.data?.has_pin ? <Notice>Buat PIN dulu di atas.</Notice> : (
            <>
              <div className="mb-3"><PinBox label="Masukkan PIN" value={pin} onChange={setPin} /></div>
              <div className="grid grid-cols-2 gap-2">
                <Btn variant="outline" onClick={() => setAskDelete(false)}>Batal</Btn>
                <Btn variant="danger" disabled={pin.length !== 4 || del.isPending} onClick={() => del.mutate()}>Hapus</Btn>
              </div>
            </>
          )}
        </Card>
      )}

      {(dels.data ?? []).length > 0 && (
        <Card tone="plain">
          <p className="mb-1 font-extrabold">Permintaan hapus</p>
          {dels.data!.slice(0, 5).map((d) => <p key={d.id} className="text-sm font-semibold text-muted">{d.recording_count} rekaman · permanen paling lambat {new Date(d.purge_due_at).toLocaleDateString("id-ID")} · {d.status === "done" ? "selesai" : "diproses"}</p>)}
        </Card>
      )}

      {(log.data ?? []).length > 0 && (
        <Card tone="plain">
          <p className="mb-1 font-extrabold">Riwayat guru mendengar rekaman</p>
          {log.data!.slice(0, 10).map((l) => <p key={l.id} className="text-sm font-semibold text-muted">{l.teacher} · {l.member} · {new Date(l.at).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}</p>)}
        </Card>
      )}
    </Page>
  );
}
