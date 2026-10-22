import { useQuery } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { api } from "../lib/api";
import { loadQuranPrefs } from "../lib/quranPrefs";
import { Mascot } from "../components/game/Mascot";
import { NavMic, NavPlay } from "../components/icons/NavIcons";

type Item = { index: number; arabic: string; title: string; tip: string; articulation: "raised" | "flat" | "throat" | null; versus: string | null; audio_url: string };
type Cur = { point: number; items: Item[]; draft: boolean };

/** Diagram mulut sederhana: posisi lidah. Animasi dimatikan bila pengguna memilih mengurangi gerakan. */
function MouthDiagram({ kind }: { kind: "raised" | "flat" | "throat" }) {
  const tongue = kind === "raised" ? "M20 88 Q70 80 120 60 Q150 46 168 50 L168 90 L20 98 Z" : kind === "flat" ? "M20 88 Q100 86 168 84 L168 96 L20 98 Z" : "M20 88 Q100 90 168 92 L168 98 L20 98 Z";
  return (
    <svg viewBox="0 0 220 120" className="w-full" role="img" aria-label={kind === "raised" ? "Pangkal lidah naik ke langit-langit" : kind === "flat" ? "Lidah rata" : "Suara dari tenggorokan"}>
      <path d="M30 22 Q120 -2 196 60" stroke="#6C63C9" strokeWidth="5" fill="none" strokeLinecap="round" />
      <rect x="14" y="26" width="10" height="22" rx="4" fill="#fff" stroke="#6C63C9" strokeWidth="3" />
      <rect x="14" y="86" width="10" height="20" rx="4" fill="#fff" stroke="#6C63C9" strokeWidth="3" />
      <path d="M8 60 q-8 8 0 20 q14 -6 8 -20z" fill="#F26B3A" />
      <path d={tongue} fill="#F2B01E" stroke="#C98A0A" strokeWidth="3">
        {kind !== "throat" && <animate attributeName="opacity" values="1;.75;1" dur="2.4s" repeatCount="indefinite" />}
      </path>
      {kind === "throat" && <circle cx="196" cy="86" r="9" fill="#0F766E"><animate attributeName="r" values="7;11;7" dur="1.6s" repeatCount="indefinite" /></circle>}
      <circle cx={kind === "raised" ? 150 : 130} cy={kind === "raised" ? 58 : 85} r="5" fill="#0F766E" />
      <text x="150" y="14" fontSize="11" fontWeight="800" fill="#3C3489">langit-langit</text>
      <text x="26" y="44" fontSize="11" fontWeight="800" fill="#3C3489" dx="12">gigi</text>
      <text x="22" y="118" fontSize="11" fontWeight="800" fill="#7A4A1A">lidah</text>
    </svg>
  );
}

/** Detail satu Pulau: tiga latihan. Pra-cek AI membantu; keputusan lulus ada pada guru atau orang tua. */
export function LatihanTahsinPage() {
  const { point } = useParams();
  const [sp] = useSearchParams();
  const nav = useNavigate();
  const i = Math.min(3, Math.max(1, Number(sp.get("i") ?? 1)));
  const prefs = loadQuranPrefs();
  const [slow, setSlow] = useState(false);
  const [playing, setPlaying] = useState(false);
  const audio = useRef<HTMLAudioElement | null>(null);
  const q = useQuery({ queryKey: ["tahsin-cur", point, prefs.reciterId], queryFn: () => api<Cur>(`/tahsin/curriculum/${point}?reciter_id=${encodeURIComponent(prefs.reciterId)}`) });
  const it = q.data?.items.find((x) => x.index === i);
  if (q.isError) return <div className="space-y-3 p-8 text-center"><p className="font-extrabold">Pulau tidak ditemukan.</p><button type="button" className="font-extrabold text-brand" onClick={() => nav("/tahsin")}>Kembali ke peta</button></div>;
  if (!it) return <p className="p-8 text-center font-extrabold text-muted">Memuat…</p>;

  const listen = (rate: number) => {
    const el = audio.current ?? (audio.current = new Audio());
    el.pause();
    el.src = it.audio_url;
    el.playbackRate = rate;
    el.onended = () => setPlaying(false);
    el.onerror = () => setPlaying(false);
    void el.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  };
  const nextPath = i < 3 ? `/tahsin/${point}?i=${i + 1}` : "/tahsin";
  const go = () => {
    audio.current?.pause();
    const p = new URLSearchParams({ context: "tahsin", text: it.arabic, next: nextPath });
    nav(`/setor?${p}`);
  };
  return (
    <div className="space-y-4 px-4 pb-10 pt-3">
      <div className="flex items-center gap-3">
        <button type="button" aria-label="Tutup" onClick={() => nav("/tahsin")} className="-ml-2 flex h-11 w-11 items-center justify-center text-brand">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </button>
        <div className="flex-1">
          <div className="flex gap-2" role="progressbar" aria-valuemin={1} aria-valuemax={3} aria-valuenow={i} aria-label={`Latihan ${i} dari 3`}>
            {[1, 2, 3].map((n) => <span key={n} className={`h-3.5 flex-1 rounded-pill ${n <= i ? "bg-teal" : "bg-lav"}`} />)}
          </div>
          <p className="mt-1 text-sm font-extrabold text-brand-dark">Pulau {point} · Latihan {i} dari 3</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Mascot mood="happy" size={64} />
        <p className="flex-1 rounded-[24px] bg-brand p-4 text-lg font-extrabold text-white">Dengarkan dulu, lalu tirukan ya!</p>
      </div>

      <div className="rounded-[32px] bg-teal px-4 py-8 text-center text-white">
        <p dir="rtl" lang="ar" className="font-quran text-[5.5rem] leading-[1.4]">{it.arabic}</p>
        <p className="mt-2 text-2xl font-extrabold">{it.title}</p>
        {it.versus && <p className="font-bold opacity-90">Bandingkan dengan huruf {it.versus}</p>}
      </div>

      <div className="rounded-[24px] bg-brand-light p-4">
        {it.articulation && <MouthDiagram kind={it.articulation} />}
        <p className="mt-2 text-center font-extrabold text-brand-dark">{it.tip}</p>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-2 text-center">
        <button type="button" onClick={() => { setSlow(false); listen(1); }} className="flex flex-col items-center gap-1 font-extrabold text-brand-dark" aria-label="Dengar contoh bacaan">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-lav text-brand">{playing && !slow ? "…" : <NavPlay size={28} />}</span>Dengar
        </button>
        <button type="button" onClick={go} className="flex flex-col items-center gap-1 font-extrabold text-brand-dark" aria-label="Ketuk, lalu baca">
          <span className="flex h-28 w-28 items-center justify-center rounded-full bg-brand text-white ring-8 ring-lav"><NavMic size={52} /></span>Ketuk, lalu baca
        </button>
        <button type="button" onClick={() => { setSlow(true); listen(0.6); }} className="flex flex-col items-center gap-1 font-extrabold text-brand-dark" aria-label="Dengar pelan">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-lav text-brand">{playing && slow ? "…" : "🐢"}</span>Pelan
        </button>
      </div>
      <p className="text-center text-xs font-bold text-muted">Contoh bacaan diambil dari ayat yang memuat huruf atau hukum ini. Pra-cek AI hanya membantu; guru atau orang tua yang memutuskan.</p>
    </div>
  );
}
