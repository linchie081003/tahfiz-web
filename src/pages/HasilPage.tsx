import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { api, type Submission } from "../lib/api";
import { Mascot } from "../components/game/Mascot";
import { Card, Chip, Page, ScreenHead } from "../components/ui/ui";
import { Btn } from "../components/ui/ui";
import { StateScreen, Tips } from "../components/ui/StateScreen";

type Ins = { available?: boolean; summaryPercent?: number; reason?: string; wordMarks?: { index: number; word: string; status: string }[] };

/** Hasil setoran untuk anak: menunggu pra-cek, pra-cek gagal, atau hasil kata per kata. AI hanya pra-cek. */
export function HasilPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const next = (useLocation().state as { next?: string | null } | null)?.next ?? "/";
  const qc = useQueryClient();
  const [waited, setWaited] = useState(0);
  const q = useQuery({
    queryKey: ["hasil", id],
    queryFn: () => api<Submission>(`/setor/${id}`),
    refetchInterval: (query) => (query.state.data?.ai_status === "completed" || query.state.data?.status !== "pending_ai" ? false : 2500),
  });
  useEffect(() => { const t = setInterval(() => setWaited((w) => w + 1), 1000); return () => clearInterval(t); }, []);
  const s = q.data;
  if (!s) return <p className="p-8 text-center font-extrabold text-muted">Memuat…</p>;
  const ins = s.ai_insights as Ins | null;
  const home = () => { qc.invalidateQueries(); nav(next, { replace: true }); };

  if (s.ai_status !== "completed" && waited >= 6) {
    return (
      <StateScreen mood="default" title="AI masih mendengarkan" lead="Biasanya cuma sebentar. Kamu boleh lanjut, hasilnya menyusul."
        actions={[{ label: "Lanjut belajar", onClick: home }, { label: "Tunggu sebentar", variant: "outline", onClick: () => setWaited(0) }]}>
        <Card tone="lav"><p className="font-extrabold">Sedang diperiksa AI…</p><p className="text-sm font-semibold text-muted">Jika terlalu lama, Ayah/Ibu atau guru tetap bisa mendengar rekamanmu. AI hanya pra-cek.</p></Card>
      </StateScreen>
    );
  }
  if (s.ai_status !== "completed") return <div className="px-4 pt-16 text-center"><Mascot mood="default" size={104} className="mx-auto" /><p className="mt-4 text-xl font-extrabold">Sedang diperiksa AI…</p></div>;

  if (!ins?.available) {
    return (
      <StateScreen mood="default" title="Penilaian AI belum bisa" lead="Rekamanmu aman. Guru atau orang tua tetap bisa mendengarnya dan memutuskan."
        actions={[{ label: next === "/" ? "Selesai" : "Lanjut", onClick: home }]}>
        <Card tone="lav" className="text-left"><Chip tone="gold">Menunggu didengar</Chip><p className="mt-1 font-bold">{s.reference_text.slice(0, 40)}</p><p className="text-sm font-semibold text-muted">Ayah, Ibu, atau guru yang memutuskan lanjut atau ulang.</p></Card>
        <p className="text-sm font-bold text-muted">Tidak ada bintang yang hilang. AI hanya pra-cek, bukan penentu.</p>
      </StateScreen>
    );
  }
  const marks = ins.wordMarks ?? [];
  const ok = marks.filter((m) => m.status !== "perlu_di_perbaiki").length;
  const pct = ins.summaryPercent ?? 0;
  return (
    <Page>
      <ScreenHead back={false} eyebrow="Hasil" title={pct >= 90 ? "Hebat!" : pct >= 60 ? "Hampir benar!" : "Ayo coba lagi"} />
      <Card tone="mint">
        <p className="text-lg font-extrabold">{marks.length ? `${ok} dari ${marks.length} kata sudah tepat` : `Kecocokan sekitar ${pct}%`}</p>
        {marks.length > 0 && (
          <div className="mt-3 flex flex-wrap justify-end gap-2" dir="rtl">
            {marks.map((m) => (
              <span key={m.index} className={`rounded-2xl px-3 py-1.5 font-quran text-2xl ${m.status === "perlu_di_perbaiki" ? "bg-cream ring-2 ring-gold" : "bg-white"}`}>
                {m.word}
                <span className="block text-center font-sans text-[11px] font-extrabold text-muted">{m.status === "perlu_di_perbaiki" ? "Terlewat" : "Tepat"}</span>
              </span>
            ))}
          </div>
        )}
      </Card>
      <Tips title="Ingat" items={["Ini pra-cek AI, bukan nilai akhir.", "Ayah, Ibu, atau guru yang memutuskan lanjut atau mengulang."]} />
      <div className="grid grid-cols-2 gap-2">
        <Btn variant="outline" onClick={() => nav(-1)}>Ulangi</Btn>
        <Btn onClick={home}>{next === "/" ? "Selesai" : "Lanjut"}</Btn>
      </div>
    </Page>
  );
}
