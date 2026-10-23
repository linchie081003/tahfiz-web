import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { GameButton } from "../components/game/GameButton";
import { GameCard } from "../components/game/GameCard";
import { GameHeader } from "../components/game/GameHeader";
import { friendlyError, useGameToast } from "../components/game/GameToast";
import { AppPage } from "../components/layout/AppPage";
import { api } from "../lib/api";

type Item = { id: string; member_name: string; surah_name: string; ayah_start: number; ayah_end: number; note: string | null };

function Row({ it, onDone }: { it: Item; onDone: () => void }) {
  const toast = useGameToast();
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const send = async (decision: "lulus" | "tolak") => {
    if (!note.trim()) { toast("Isi dasar keputusan dulu.", "error"); return; }
    setBusy(true);
    try {
      await api(`/hafalan/verifikasi/${it.id}`, { method: "POST", body: JSON.stringify({ decision, note: note.trim() }) });
      toast(decision === "lulus" ? "Dinyatakan lulus." : "Ditolak; progres dihitung ulang.", "success");
      onDone();
    } catch (e) {
      toast(friendlyError(e), "error");
    } finally {
      setBusy(false);
    }
  };
  return (
    <GameCard className="space-y-2">
      <p className="font-extrabold text-outline">{it.member_name} · {it.surah_name} ayat {it.ayah_start}{it.ayah_end > it.ayah_start ? `–${it.ayah_end}` : ""}</p>
      {it.note && <p className="text-xs font-semibold text-outline/75">{it.note}</p>}
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        maxLength={500}
        rows={2}
        className="w-full rounded-game border-2 border-line p-2 text-sm font-semibold"
        placeholder="Dasar keputusan, mis. didengar langsung sudah lancar"
      />
      <div className="grid grid-cols-2 gap-3">
        <GameButton size="md" variant="gold" disabled={busy} onClick={() => void send("tolak")}>Belum lulus</GameButton>
        <GameButton size="md" disabled={busy} onClick={() => void send("lulus")}>Lulus</GameButton>
      </div>
    </GameCard>
  );
}

/** Hafalan lama tanpa bukti penilaian: tidak dihitung lulus sampai orang tua memutuskan. */
export function VerifikasiHafalanPage() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["verifikasi-hafalan"], queryFn: () => api<Item[]>("/hafalan/verifikasi") });
  const refresh = () => {
    void qc.invalidateQueries({ queryKey: ["verifikasi-hafalan"] });
    void qc.invalidateQueries({ queryKey: ["parent-dashboard"] });
    void qc.invalidateQueries({ queryKey: ["home"] });
    void qc.invalidateQueries({ queryKey: ["peta"] });
  };
  return (
    <AppPage className="pb-8">
      <GameHeader title="Verifikasi hafalan lama" to="/parent" />
      <p className="text-xs font-semibold text-outline/90">
        Data lama ini belum punya catatan penilaian lulus, jadi belum dihitung sebagai hafalan. Dengarkan lalu putuskan.
      </p>
      {!data?.length && <GameCard>Tidak ada hafalan yang perlu diverifikasi.</GameCard>}
      {data?.map((it) => <Row key={it.id} it={it} onDone={refresh} />)}
    </AppPage>
  );
}
