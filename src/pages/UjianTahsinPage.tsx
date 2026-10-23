import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { api } from "../lib/api";
import { loadQuranPrefs } from "../lib/quranPrefs";
import { FocusArabic } from "../components/FocusArabic";
import { Mascot } from "../components/game/Mascot";
import { NavMic } from "../components/icons/NavIcons";

type Item = { index: number; focus?: string; arabic: string; title: string };
type Cur = { point: number; items: Item[] };

/** Jumlah soal dalam satu ujian Pulau; dibaca berurutan dalam satu rekaman. */
const EXAM_ITEMS = 3;
const FOCUS_COLOR = "#FFD34D";
const focusOf = (it: Item) => it.focus ?? [...it.title].filter((c) => /[ء-ي]/.test(c)).join("");
const pick = <T,>(a: T[], n: number) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b.slice(0, n); };

/** Ujian Pulau: tiga soal dari Pulau ini, direkam sekali, lalu dikirim ke guru atau orang tua untuk dinilai. */
export function UjianTahsinPage() {
  const { point } = useParams();
  const [sp, setSp] = useSearchParams();
  const nav = useNavigate();
  const prefs = loadQuranPrefs();
  const q = useQuery({ queryKey: ["tahsin-cur", point, prefs.reciterId], queryFn: () => api<Cur>(`/tahsin/curriculum/${point}?reciter_id=${encodeURIComponent(prefs.reciterId)}`) });
  const ids = useMemo(() => (sp.get("o") ?? "").split(",").map(Number).filter((n) => Number.isInteger(n) && n >= 1), [sp]);
  const items = q.data?.items ?? [];
  // Soal dipilih sekali dan disimpan di alamat, supaya tetap sama saat halaman dimuat ulang.
  const chosen = ids.map((i) => items.find((x) => x.index === i)).filter((x): x is Item => !!x);
  const needPick = !!q.data && !chosen.length && items.length > 0;
  useEffect(() => { if (needPick) setSp({ o: pick(items, EXAM_ITEMS).map((x) => x.index).join(",") }, { replace: true }); }, [needPick]); // eslint-disable-line react-hooks/exhaustive-deps
  if (q.isError) return <div className="space-y-3 p-8 text-center"><p className="font-extrabold">Pulau tidak ditemukan.</p><button type="button" className="font-extrabold text-brand" onClick={() => nav("/tahsin")}>Kembali ke peta</button></div>;
  if (!q.data) return <p className="p-8 text-center font-extrabold text-muted">Memuat…</p>;
  if (!chosen.length) return <p className="p-8 text-center font-extrabold text-muted">Menyiapkan soal…</p>;
  const record = () => {
    const text = chosen.map((x) => x.arabic).join("  •  ");
    const focus = [...new Set(chosen.flatMap((x) => [...focusOf(x)]))].join("");
    nav(`/setor?${new URLSearchParams({ context: "tahsin", text, focus, next: "/tahsin", point: String(point) })}`);
  };
  return (
    <div className="space-y-4 px-4 pb-10 pt-3">
      <div className="flex items-center gap-3">
        <button type="button" aria-label="Kembali" onClick={() => nav(`/tahsin/${point}`)} className="-ml-2 flex h-11 w-11 items-center justify-center text-brand">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg>
        </button>
        <p className="text-lg font-extrabold text-brand-dark">Ujian Pulau {point}</p>
      </div>
      <div className="flex items-center gap-3">
        <Mascot mood="happy" size={64} />
        <p className="flex-1 rounded-[24px] bg-brand p-4 text-lg font-extrabold text-white">Baca {chosen.length} soal ini berurutan dalam satu rekaman.</p>
      </div>
      <ol className="space-y-3">
        {chosen.map((x, k) => (
          <li key={x.index} className="rounded-[28px] bg-teal px-4 py-5 text-center text-white">
            <p className="text-sm font-extrabold opacity-90">Soal {k + 1}</p>
            <FocusArabic text={x.arabic} focus={focusOf(x)} color={FOCUS_COLOR} className="block" style={{ fontSize: "3.2rem" }} />
          </li>
        ))}
      </ol>
      <p className="text-center text-sm font-bold text-muted"><span style={{ color: "#C98A00" }}>●</span> Huruf berwarna kuning adalah yang dinilai. Belum siap? Latihan dulu, tidak ada batas waktu.</p>
      <button type="button" onClick={record} className="btn-cta"><NavMic size={22} /> Mulai rekam ujian</button>
    </div>
  );
}
