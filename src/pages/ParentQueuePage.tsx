import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ArabicAyahText } from "../components/ArabicAyahText";
import { GameButton } from "../components/game/GameButton";
import { GameCard } from "../components/game/GameCard";
import { IconBack } from "../components/icons/GameIcons";
import { AppPage, PageTitleRow } from "../components/layout/AppPage";
import { api, type Submission } from "../lib/api";

export function ParentQueuePage() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["queue"], queryFn: () => api<Submission[]>("/setor/queue") });

  const evaluate = async (id: string, status: string) => {
    const sub = data?.find((s) => s.id === id);
    const rubric = (sub?.ai_insights as { rubricSuggestion?: Record<string, number> })?.rubricSuggestion;
    await api(`/setor/${id}/evaluate`, {
      method: "POST",
      body: JSON.stringify({
        status,
        rubric_scores: rubric,
      }),
    });
    qc.invalidateQueries({ queryKey: ["queue"] });
    qc.invalidateQueries({ queryKey: ["home"] });
    qc.invalidateQueries({ queryKey: ["peta"] });
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
      <p className="text-xs font-semibold text-outline/90">AI = rekomendasi. Keputusan akhir pada Anda.</p>
      {!data?.length && <GameCard>Tidak ada setoran menunggu.</GameCard>}
      {data?.map((s) => {
        const insights = s.ai_insights as {
          summaryPercent?: number;
          tajwidFlags?: { note: string }[];
          makhrajFlags?: { message: string }[];
          rubricSuggestion?: Record<string, number>;
          wordAlignment?: { word: string; match: boolean }[];
        } | null;
        return (
          <GameCard key={s.id} className="space-y-3">
            <p className="font-extrabold text-outline">
              {s.member_name} · {s.context}
            </p>
            <ArabicAyahText textUthmani={s.reference_text} textTajweed={s.reference_text_tajweed} />
            {s.recording_url && <audio controls src={s.recording_url} className="w-full rounded-game border-2 border-outline" />}
            {insights && (
              <div className="space-y-2 text-sm text-outline">
                <p className="font-bold">Ketepatan AI: {insights.summaryPercent ?? "—"}%</p>
                {insights.wordAlignment?.length ? (
                  <p className="flex flex-wrap gap-1">
                    {insights.wordAlignment.map((w, i) => (
                      <span
                        key={i}
                        className={`rounded-pill px-2 py-0.5 text-xs font-bold ${w.match ? "bg-game-green-start/40" : "bg-game-coral/40"}`}
                      >
                        {w.word}
                      </span>
                    ))}
                  </p>
                ) : null}
                <div className="flex flex-wrap gap-1">
                  {insights.tajwidFlags?.map((f, i) => (
                    <span key={i} className="rounded-pill border border-outline bg-brand-light px-2 py-0.5 text-xs font-semibold">
                      {f.note}
                    </span>
                  ))}
                </div>
                {insights.makhrajFlags?.map((f, i) => (
                  <p key={i} className="text-xs">
                    {f.message}
                  </p>
                ))}
              </div>
            )}
            <div className="grid gap-2 sm:grid-cols-2">
              <GameButton size="md" onClick={() => void evaluate(s.id, "passed")}>
                Lulus
              </GameButton>
              <GameButton size="md" variant="gold" onClick={() => void evaluate(s.id, "needs_retry")}>
                Ulangi
              </GameButton>
              <GameButton size="md" variant="danger" onClick={() => void evaluate(s.id, "not_fluent")}>
                Belum lancar
              </GameButton>
            </div>
          </GameCard>
        );
      })}
    </AppPage>
  );
}
