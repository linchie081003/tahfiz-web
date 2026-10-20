import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "react-router-dom";
import { ArabicAyahText } from "../components/ArabicAyahText";
import { GameButton } from "../components/game/GameButton";
import { GameCard } from "../components/game/GameCard";
import { friendlyError, useGameToast } from "../components/game/GameToast";
import { StarRating } from "../components/game/StarRating";
import { IconBack } from "../components/icons/GameIcons";
import { AppPage, PageTitleRow } from "../components/layout/AppPage";
import { api, type Submission } from "../lib/api";

const RUBRIC: { key: string; label: string }[] = [
  { key: "makhraj", label: "Makhraj / huruf" },
  { key: "tajwid", label: "Tajwid" },
  { key: "kelancaran", label: "Kelancaran" },
  { key: "hafalan", label: "Hafalan tanpa melihat" },
];

type Insights = {
  available?: boolean;
  reason?: string;
  summaryPercent?: number;
  modelVersion?: string;
  tajwidFlags?: { note: string }[];
  makhrajFlags?: { message: string }[];
  wordMarks?: { index: number; word: string; status: string }[];
};

function EvaluateCard({ s, onDone }: { s: Submission; onDone: () => void }) {
  const toast = useGameToast();
  const [scores, setScores] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const insights = s.ai_insights as Insights | null;
  const allRated = RUBRIC.every((r) => (scores[r.key] ?? 0) > 0);

  const send = async (status: "passed" | "needs_retry") => {
    if (status === "passed" && !allRated) {
      toast("Beri bintang untuk keempat penilaian dulu.", "error");
      return;
    }
    setBusy(true);
    try {
      await api(`/setor/${s.id}/evaluate`, {
        method: "POST",
        body: JSON.stringify({
          status,
          rubric_scores: allRated ? scores : undefined,
          evaluator_notes: notes.trim() || undefined,
        }),
      });
      toast(status === "passed" ? "Lulus! Ayat berikutnya terbuka." : "Diminta mengulang.", "success");
      onDone();
    } catch (e) {
      toast(friendlyError(e), "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <GameCard className="space-y-3">
      <div>
        <p className="font-extrabold text-outline">{s.member_name ?? "Anak"}</p>
        <p className="text-xs font-semibold text-outline/70">
          {s.context} · disetor {new Date(s.created_at).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}
        </p>
      </div>
      <ArabicAyahText textUthmani={s.reference_text} textTajweed={s.reference_text_tajweed} />
      {s.recording_url && <audio controls src={s.recording_url} className="w-full rounded-game border-2 border-outline" />}

      {insights && insights.available === false && (
        <p className="rounded-game border-2 border-outline bg-brand-light/60 p-2 text-xs font-semibold text-outline">
          Pra-cek otomatis tidak tersedia
          {insights.reason === "no_consent" ? " (belum diizinkan di Pengaturan)" : ""}. Nilai berdasarkan rekaman yang Anda dengar.
        </p>
      )}
      {insights && insights.available !== false && (
        <details className="rounded-game border-2 border-outline bg-brand-light/60 p-2 text-sm text-outline" open>
          <summary className="cursor-pointer font-bold">
            <span className="mr-2 rounded-pill border-2 border-outline bg-[#FFE08A] px-2 py-0.5 text-xs font-extrabold">
              Pra-cek (saran)
            </span>
            Kata terdengar sesuai: {insights.summaryPercent ?? "—"}%
          </summary>
          <p className="mt-2 text-xs font-semibold">Hasil transkripsi otomatis bisa keliru, terutama untuk suara anak. Jadikan saran saja.</p>
          {insights.wordMarks?.length ? (
            <p className="mt-2 flex flex-wrap gap-1" dir="rtl">
              {insights.wordMarks.map((w) => (
                <span
                  key={w.index}
                  className={`rounded-pill px-2 py-0.5 text-sm font-bold ${w.status === "benar" ? "bg-game-green-start/40" : "bg-game-coral/40"}`}
                >
                  {w.word}
                </span>
              ))}
            </p>
          ) : null}
          {insights.tajwidFlags?.length ? (
            <div className="mt-2 flex flex-wrap gap-1">
              {insights.tajwidFlags.map((f, i) => (
                <span key={i} className="rounded-pill border border-outline bg-white px-2 py-0.5 text-xs font-semibold">
                  {f.note}
                </span>
              ))}
            </div>
          ) : null}
        </details>
      )}

      <div className="space-y-1 rounded-game border-2 border-outline bg-white p-3">
        {RUBRIC.map((r) => (
          <StarRating
            key={r.key}
            label={r.label}
            value={scores[r.key] ?? 0}
            onChange={(n) => setScores((p) => ({ ...p, [r.key]: n }))}
          />
        ))}
      </div>

      <label className="block text-sm font-bold text-outline">
        Catatan untuk {s.member_name ?? "anak"} (opsional)
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          maxLength={500}
          rows={2}
          className="mt-1 w-full rounded-game border-[3px] border-outline p-2 text-sm font-semibold"
          placeholder="Contoh: bagus, perhatikan huruf ع"
        />
      </label>

      <div className="grid grid-cols-2 gap-3">
        <GameButton size="md" variant="gold" disabled={busy} onClick={() => void send("needs_retry")}>
          Ulangi
        </GameButton>
        <GameButton size="md" disabled={busy} onClick={() => void send("passed")}>
          Lulus
        </GameButton>
      </div>
      <p className="text-center text-xs font-semibold text-outline/70">Lulus membuka ayat berikutnya dan menambah bintang.</p>
    </GameCard>
  );
}

export function ParentQueuePage() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["queue"], queryFn: () => api<Submission[]>("/setor/queue") });

  const refresh = () => {
    void qc.invalidateQueries({ queryKey: ["queue"] });
    void qc.invalidateQueries({ queryKey: ["home"] });
    void qc.invalidateQueries({ queryKey: ["peta"] });
  };

  return (
    <AppPage className="pb-8">
      <div className="flex flex-wrap gap-3 text-sm font-bold">
        <Link to="/parent" className="inline-flex items-center gap-1 text-outline underline">
          <IconBack size={22} decorative /> Dashboard
        </Link>
        <Link to="/" className="text-outline/80 underline">
          Home anak
        </Link>
      </div>
      <PageTitleRow>
        <h1 className="game-text-stroke text-2xl font-extrabold">Antrean penilaian</h1>
      </PageTitleRow>
      <p className="text-xs font-semibold text-outline/90">Keputusan akhir ada pada Anda.</p>
      {!data?.length && <GameCard>Tidak ada setoran menunggu.</GameCard>}
      {data?.map((s) => (
        <EvaluateCard key={s.id} s={s} onDone={refresh} />
      ))}
    </AppPage>
  );
}
