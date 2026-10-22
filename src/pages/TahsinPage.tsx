import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ArabicAyahText } from "../components/ArabicAyahText";
import { QuranAudioPlayer } from "../components/QuranAudioPlayer";
import { TajweedLegend } from "../components/TajweedLegend";
import { TahsinPulau } from "../components/TahsinPulau";
import { Card, Chip, Page, ScreenHead } from "../components/ui/ui";
import { api } from "../lib/api";
import { loadQuranPrefs } from "../lib/quranPrefs";

type TahsinReference = { reference_text: string; text_tajweed?: string | null; audio_urls: string[]; status: string; hint: string; surah_id: number };
const STATUS: Record<string, string> = { not_started: "Belum mulai", in_progress: "Sedang berlatih", pending_eval: "Menunggu keputusan", passed: "Pulau 1–3 selesai" };

export function TahsinPage() {
  const prefs = loadQuranPrefs();
  const { data } = useQuery({ queryKey: ["tahsin", prefs.reciterId], queryFn: () => api<TahsinReference>(`/tahsin/reference?reciter_id=${encodeURIComponent(prefs.reciterId)}`) });
  const session = useQuery({ queryKey: ["session"], queryFn: () => api<{ role: string; member_id?: string | null }>("/auth/session") });
  if (!data) return <p className="p-8 text-center font-extrabold text-muted">Memuat…</p>;
  const q = new URLSearchParams({ context: "tahsin", text: data.reference_text, surah_id: String(data.surah_id), ayah_start: "1", ayah_end: "2" });
  return (
    <Page>
      <ScreenHead to="/" eyebrow="Latihan tahsin" title="Dengarkan dulu, lalu tirukan ya!" right={<Chip tone="lav">{STATUS[data.status] ?? data.status}</Chip>} />
      <Card tone="plain"><ArabicAyahText textUthmani={data.reference_text} textTajweed={data.text_tajweed} /></Card>
      <Card tone="lav" className="space-y-2">
        <p className="font-extrabold">Dengarkan qori dulu</p>
        <QuranAudioPlayer sources={data.audio_urls} label="Dengar" />
        <p className="text-sm font-semibold text-muted">{data.hint}</p>
      </Card>
      <Link to={`/setor?${q}`} className="flex min-h-[56px] items-center justify-center rounded-pill bg-brand text-lg font-extrabold text-white">Ketuk, lalu baca</Link>
      <TahsinPulau memberId={session.data?.member_id} isParent={session.data?.role === "parent"} />
      <TajweedLegend tone="dark" />
    </Page>
  );
}
