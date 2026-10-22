import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../lib/api";
import { Btn, Card, Page, ScreenHead } from "../../components/ui/ui";
import { friendlyError, useGameToast } from "../../components/game/GameToast";

/** Persetujuan orang tua untuk merekam suara anak (terpisah dari syarat layanan). */
export function PersetujuanOrtuPage() {
  const nav = useNavigate();
  const qc = useQueryClient();
  const toast = useGameToast();
  const [ok, setOk] = useState(false);
  const c = useQuery({ queryKey: ["consent"], queryFn: () => api<{ granted: boolean; retention_days: number }>("/family/consent/recording") });
  const days = c.data?.retention_days ?? 30;
  const save = useMutation({
    mutationFn: () => api("/family/consent/recording", { method: "POST", body: JSON.stringify({ granted: true }) }),
    onSuccess: () => { qc.invalidateQueries(); toast("Persetujuan tersimpan", "success"); nav("/parent", { replace: true }); },
    onError: (e) => toast(friendlyError(e), "error"),
  });
  return (
    <Page>
      <ScreenHead eyebrow="Khusus orang tua" title="Izin rekaman suara anak" />
      {[
        ["Untuk apa direkam", "Mengecek bacaan dan hafalan anak, lalu memberi umpan balik."],
        ["Siapa yang mendengar", "Sistem pengecek bacaan, dan guru hanya bila Anda mengizinkan."],
        ["Berapa lama disimpan", `Rekaman latihan disimpan ${days} hari lalu dihapus otomatis. Rekaman bisa dihapus kapan saja dari Privasi suara.`],
      ].map(([t, d]) => <Card key={t} tone="lav"><p className="font-extrabold">{t}</p><p className="font-semibold text-muted">{d}</p></Card>)}
      <label className="flex items-start gap-3 rounded-[20px] bg-white p-3 font-bold">
        <input type="checkbox" className="mt-1 h-6 w-6 accent-[#0F766E]" checked={ok} onChange={(e) => setOk(e.target.checked)} />
        Saya orang tua atau wali, dan setuju suara anak direkam untuk pengecekan bacaan.
      </label>
      <p className="text-sm font-semibold text-muted">Izin guru mendengar rekaman diberikan terpisah, per guru, di menu Guru.</p>
      <Btn disabled={!ok || save.isPending || c.data?.granted} onClick={() => save.mutate()}>{c.data?.granted ? "Sudah disetujui" : "Setuju dan lanjut"}</Btn>
    </Page>
  );
}
