import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ArabicAyahText } from "../components/ArabicAyahText";
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
    <div className="space-y-4 p-4">
      <Link to="/" className="text-white underline">
        ← Home
      </Link>
      <h1 className="text-2xl font-extrabold">Antrean penilaian</h1>
      <p className="text-xs text-white/80">AI = rekomendasi. Keputusan akhir pada Anda.</p>
      {!data?.length && <p>Tidak ada setoran menunggu.</p>}
      {data?.map((s) => {
        const insights = s.ai_insights as {
          summaryPercent?: number;
          tajwidFlags?: { note: string }[];
          makhrajFlags?: { message: string }[];
          rubricSuggestion?: Record<string, number>;
        } | null;
        return (
          <div key={s.id} className="card-surface space-y-2 p-4">
            <p className="font-bold">
              {s.member_name} · {s.context}
            </p>
            <ArabicAyahText textUthmani={s.reference_text} textTajweed={s.reference_text_tajweed} />
            {s.recording_url && <audio controls src={s.recording_url} className="w-full" />}
            {insights && (
              <div className="text-sm text-gray-700">
                <p>Ketepatan AI: {insights.summaryPercent ?? "—"}%</p>
                {insights.tajwidFlags?.map((f, i) => (
                  <span key={i} className="mr-1 rounded bg-purple-100 px-2 py-0.5">
                    {f.note}
                  </span>
                ))}
                {insights.makhrajFlags?.map((f, i) => (
                  <p key={i}>{f.message}</p>
                ))}
                {insights.rubricSuggestion && (
                  <p>
                    Saran rubrik: K{insights.rubricSuggestion.kelancaran} T{insights.rubricSuggestion.tajwid} M
                    {insights.rubricSuggestion.makhraj}
                  </p>
                )}
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              <button type="button" className="rounded-xl bg-green-600 px-3 py-2 text-white" onClick={() => evaluate(s.id, "passed")}>
                Lulus
              </button>
              <button type="button" className="rounded-xl bg-orange-500 px-3 py-2 text-white" onClick={() => evaluate(s.id, "needs_retry")}>
                Perlu diulang
              </button>
              <button type="button" className="rounded-xl bg-gray-500 px-3 py-2 text-white" onClick={() => evaluate(s.id, "not_fluent")}>
                Belum lancar
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
