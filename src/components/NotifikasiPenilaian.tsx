import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";

type Notif = { id: string; kind: string; title: string; body: string; submission_id: string; member_id: string; created_at: string; still_pending: boolean; can_act: boolean };

/** Notifikasi penilaian tertunda (24/48/72 jam). Sistem tidak mengganti penilai atau meluluskan hafalan karena waktu. */
export function NotifikasiPenilaian({ role }: { role: "parent" | "teacher" }) {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["notifikasi"], queryFn: () => api<Notif[]>("/notifikasi"), refetchInterval: 120000 });
  const [takeover, setTakeover] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const refresh = () => { qc.invalidateQueries({ queryKey: ["notifikasi"] }); qc.invalidateQueries({ queryKey: ["queue"] }); };
  const read = useMutation({ mutationFn: (id: string) => api(`/notifikasi/${id}/baca`, { method: "POST" }), onSuccess: refresh });
  const nudge = useMutation({
    mutationFn: (n: Notif) => api(`/setor/${n.submission_id}/ingatkan-guru`, { method: "POST" }),
    onSuccess: () => { setInfo("Guru sudah diingatkan."); refresh(); },
    onError: () => setError("Pengingat belum terkirim. Coba lagi."),
  });
  const take = useMutation({
    mutationFn: (n: Notif) => api(`/setor/${n.submission_id}/ambil-alih`, { method: "POST", body: JSON.stringify({ reason }) }),
    onSuccess: (_d, n) => { setTakeover(null); setReason(""); setInfo("Sekarang Anda yang menilai setoran ini."); read.mutate(n.id); },
    onError: () => setError("Belum bisa mengambil alih. Isi alasan lalu coba lagi."),
  });
  if (!data?.length) return null;
  return (
    <section className="space-y-3" aria-label="Notifikasi penilaian">
      <h2 className="text-lg font-extrabold text-outline">Pemberitahuan</h2>
      {data.map((n) => (
        <div key={n.id} className="space-y-2 rounded-[24px] bg-cream p-4">
          <p className="font-extrabold text-gold-ink">{n.title}</p>
          <p className="text-sm font-semibold text-outline">{n.body}</p>
          {n.can_act ? (
            <div className="space-y-2">
              <div className="grid grid-cols-1 gap-2">
                <button type="button" onClick={() => nudge.mutate(n)} className="min-h-[44px] rounded-pill bg-lav px-4 text-sm font-extrabold text-brand-dark">Ingatkan guru</button>
                <button type="button" onClick={() => read.mutate(n.id)} className="min-h-[44px] rounded-pill bg-white px-4 text-sm font-extrabold text-brand-dark">Tunggu dulu</button>
                <button type="button" onClick={() => setTakeover(takeover === n.id ? null : n.id)} aria-expanded={takeover === n.id} className="min-h-[44px] rounded-pill bg-brand px-4 text-sm font-extrabold text-white">Nilai sendiri</button>
              </div>
              {takeover === n.id && (
                <div className="space-y-2 rounded-[18px] bg-white p-3">
                  <p className="text-sm font-bold text-outline">Alasan mengambil alih penilaian dari guru (wajib):</p>
                  <input aria-label="Alasan" value={reason} onChange={(e) => setReason(e.target.value)} className="min-h-[44px] w-full rounded-2xl bg-lav px-3" placeholder="Contoh: guru sedang berhalangan" />
                  <button type="button" disabled={!reason.trim() || take.isPending} onClick={() => take.mutate(n)} className="min-h-[44px] w-full rounded-pill bg-brand text-sm font-extrabold text-white disabled:opacity-50">Ambil alih dan nilai</button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex gap-2">
              {n.still_pending && <Link to={role === "parent" ? "/parent/queue" : "/guru/setoran"} onClick={() => read.mutate(n.id)} className="flex min-h-[44px] flex-1 items-center justify-center rounded-pill bg-brand px-4 text-sm font-extrabold text-white">Buka antrean</Link>}
              <button type="button" onClick={() => read.mutate(n.id)} className="min-h-[44px] flex-1 rounded-pill bg-white px-4 text-sm font-extrabold text-brand-dark">Tutup</button>
            </div>
          )}
        </div>
      ))}
      {info && <p role="status" className="text-sm font-bold text-brand-dark">{info}</p>}
      {error && <p role="alert" className="text-sm font-bold text-coral">{error}</p>}
    </section>
  );
}
