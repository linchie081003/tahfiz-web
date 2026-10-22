import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "../../lib/api";
import { Btn, Card, Chip, Notice, Page, ScreenHead } from "../../components/ui/ui";
import { friendlyError, useGameToast } from "../../components/game/GameToast";

const STATUS: Record<string, string> = { pending: "Menunggu persetujuan instansi", approved: "Disetujui", rejected: "Ditolak" };

export function PindahInstansiPage() {
  const toast = useGameToast();
  const qc = useQueryClient();
  const [code, setCode] = useState("");
  const [confirm, setConfirm] = useState(false);
  const { data } = useQuery({ queryKey: ["transfer"], queryFn: () => api<{ request: { institution: string; status: string } | null }>("/family/transfer") });
  const send = useMutation({
    mutationFn: () => api<{ institution: string; shared: string[] }>("/family/transfer", { method: "POST", body: JSON.stringify({ institution_code: code }) }),
    onSuccess: () => { setCode(""); setConfirm(false); qc.invalidateQueries({ queryKey: ["transfer"] }); toast("Permintaan terkirim", "success"); },
    onError: (e) => toast(friendlyError(e), "error"),
  });
  const req = data?.request;
  return (
    <Page>
      <ScreenHead to="/parent/keluarga" eyebrow="Area orang tua" title="Pindah instansi" />
      {req && (
        <Card tone="mint">
          <p className="text-lg font-extrabold text-outline">{req.institution}</p>
          <Chip tone={req.status === "approved" ? "teal" : req.status === "rejected" ? "coral" : "gold"}>{STATUS[req.status] ?? req.status}</Chip>
        </Card>
      )}
      {(!req || req.status !== "pending") && (
        <Card tone="plain">
          <p className="text-lg font-extrabold text-outline">Masukkan kode instansi</p>
          <p className="mb-3 text-sm font-semibold text-muted">Hanya pemilik keluarga yang dapat meminta pindah.</p>
          <input value={code} onChange={(e) => setCode(e.target.value.trim().toUpperCase())} aria-label="Kode instansi" placeholder="Kode instansi"
            className="mb-3 min-h-[56px] w-full rounded-pill border-[3px] border-line px-5 text-center text-xl font-extrabold tracking-widest outline-none focus:border-brand" />
          {!confirm ? <Btn disabled={code.length < 4} onClick={() => setConfirm(true)}>Lanjut</Btn> : (
            <>
              <Notice>Instansi akan melihat: kemajuan tahsin dan hafalan, skor dan catatan penilaian. Rekaman hanya bila guru instansi Anda beri izin. Anda bisa menghapus data kapan saja.</Notice>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Btn variant="outline" onClick={() => setConfirm(false)}>Kembali</Btn>
                <Btn disabled={send.isPending} onClick={() => send.mutate()}>Kirim</Btn>
              </div>
            </>
          )}
        </Card>
      )}
    </Page>
  );
}
