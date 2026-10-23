import { useQuery } from "@tanstack/react-query";
import { useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { api } from "../lib/api";
import { loadQuranPrefs } from "../lib/quranPrefs";
import { Mascot } from "../components/game/Mascot";
import { NavMic, NavPlay } from "../components/icons/NavIcons";
import { FocusArabic } from "../components/FocusArabic";

type Item = { index: number; focus?: string; arabic: string; title: string; tip: string; articulation: "raised" | "flat" | "throat" | null; versus: string | null; audio_url: string; audio_urls?: string[]; audio_fallback_urls?: string[] };
type Cur = { point: number; items: Item[]; draft: boolean };

const REST = "M44 90 C90 100 170 104 240 102 C270 100 290 96 296 108 L296 114 L44 114 Z";
const RAISED = "M44 70 C90 84 170 62 244 58 C272 58 292 78 296 100 L296 114 L44 114 Z";
const FLAT_UP = "M44 86 C90 96 170 98 240 96 C270 95 290 94 296 106 L296 114 L44 114 Z";
const reduceMotion = () => typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/** Penampang mulut dari samping: gigi, langit-langit, lidah bergerak. Animasi mati bila pengguna mengurangi gerakan. */
function MouthDiagram({ kind }: { kind: "raised" | "flat" | "throat" }) {
  const still = reduceMotion();
  const label = kind === "raised" ? "Penampang mulut dari samping. Pangkal lidah naik mendekati langit-langit belakang." : kind === "flat" ? "Penampang mulut dari samping. Lidah tetap rata dan rendah." : "Penampang mulut dari samping. Suara keluar dari tenggorokan.";
  const base = kind === "raised" ? RAISED : kind === "flat" ? FLAT_UP : REST;
  const values = kind === "raised" ? `${REST};${RAISED};${REST}` : kind === "flat" ? `${REST};${FLAT_UP};${REST}` : `${REST};${REST};${REST}`;
  const dot = kind === "raised" ? { x: [240, 244, 240], y: [100, 58, 100] } : kind === "flat" ? { x: [240, 242, 240], y: [100, 94, 100] } : { x: [296, 296, 296], y: [84, 84, 84] };
  const j = (a: number[]) => a.join(";");
  return (
    <svg viewBox="0 0 340 130" width="100%" role="img" aria-label={label} style={{ display: "block" }}>
      <path d="M40 22 C100 6 210 6 270 34 C300 48 310 70 306 96" fill="none" stroke="#6C63C9" strokeWidth="5" strokeLinecap="round" />
      <rect x="30" y="20" width="16" height="26" rx="6" fill="#FFFFFF" stroke="#6C63C9" strokeWidth="3" />
      <rect x="30" y="86" width="16" height="24" rx="6" fill="#FFFFFF" stroke="#6C63C9" strokeWidth="3" />
      <path d="M14 44 Q6 66 14 88 Q30 80 32 66 Q30 52 14 44Z" fill="#F26B3A" />
      <path d="M40 114 L300 114" stroke="#E3E0EE" strokeWidth="5" strokeLinecap="round" />
      <path d={still ? base : REST} fill="#F2B01E" stroke="#C98A00" strokeWidth="3" strokeLinejoin="round">
        {!still && <animate attributeName="d" dur="2.4s" repeatCount="indefinite" calcMode="spline" keyTimes="0;0.5;1" keySplines=".4 0 .2 1;.4 0 .2 1" values={values} />}
      </path>
      <circle cx={dot.x[still ? 1 : 0]} cy={dot.y[still ? 1 : 0]} r="9" fill="#0F766E" opacity=".25">
        {!still && <><animate attributeName="r" values="7;13;7" dur="2.4s" repeatCount="indefinite" /><animate attributeName="cx" values={j(dot.x)} dur="2.4s" repeatCount="indefinite" /><animate attributeName="cy" values={j(dot.y)} dur="2.4s" repeatCount="indefinite" /></>}
      </circle>
      <circle cx={dot.x[still ? 1 : 0]} cy={dot.y[still ? 1 : 0]} r="5" fill="#0F766E">
        {!still && <><animate attributeName="cx" values={j(dot.x)} dur="2.4s" repeatCount="indefinite" /><animate attributeName="cy" values={j(dot.y)} dur="2.4s" repeatCount="indefinite" /></>}
      </circle>
      <text x="56" y="60" fontFamily="Nunito,sans-serif" fontSize="12" fontWeight="800" fill="#3C3489">gigi</text>
      <text x="262" y="30" fontFamily="Nunito,sans-serif" fontSize="12" fontWeight="800" fill="#3C3489">langit-langit</text>
      <text x="30" y="126" fontFamily="Nunito,sans-serif" fontSize="12" fontWeight="800" fill="#7A5200">lidah</text>
    </svg>
  );
}

/** Satu sesi = 5 latihan (huruf pilihan di awal, sisanya acak) supaya tidak terlalu panjang. */
const SESSION = 5;
const FOCUS_COLOR = "#FFD34D";
/** Cadangan bila server belum mengirim `focus`: huruf Arab pada judul, mis. "Huruf ص (shad)". */
const focusOf = (it: Item) => it.focus ?? [...it.title].filter((c) => /[\u0621-\u064A]/.test(c)).join("");
/** Ukuran tulisan menyesuaikan panjang teks agar tetap besar dan mudah dibaca. */
const arabSize = (t: string, small = false) => { const n = [...t].filter((c) => !/\p{M}/u.test(c)).length; const big = n <= 3 ? 6.5 : n <= 8 ? 4.5 : 3.4; return `${small ? big * 0.45 : big}rem`; };
const shuffle = <T,>(a: T[]) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };

function UjianCard({ point, passed, onStart }: { point: number; passed: boolean; onStart: () => void }) {
  return (
    <section className="rounded-[28px] bg-gold p-4 text-gold-ink" aria-label={`Ujian Pulau ${point}`}>
      <p className="text-xs font-extrabold uppercase tracking-wide">{passed ? "Sudah lulus" : "Yang dinilai"}</p>
      <p className="text-xl font-extrabold">Ujian Pulau {point}</p>
      <p className="mt-1 text-sm font-bold">{passed ? "Boleh mengulang ujian kapan saja." : "Baca 3 soal berurutan dalam satu rekaman. Guru atau orang tua yang menilai."}</p>
      <button type="button" onClick={onStart} className="mt-3 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-pill bg-white px-4 font-extrabold text-brand-dark"><NavMic size={22} /> {passed ? "Ulangi ujian" : "Mulai ujian"}</button>
    </section>
  );
}

/** Satu Pulau: latihan (Dengar dan Tirukan, tidak dikirim) dan ujian (direkam dan dinilai guru atau orang tua). */
export function LatihanTahsinPage() {
  const { point } = useParams();
  const [sp] = useSearchParams();
  const nav = useNavigate();
  const prefs = loadQuranPrefs();
  const [slow, setSlow] = useState(false);
  const [playing, setPlaying] = useState(false);
  const audio = useRef<HTMLAudioElement | null>(null);
  const token = useRef(0);
  const pts = useQuery({ queryKey: ["tahsin-points"], queryFn: () => api<{ gate_open: boolean; points: { point: number; passed: boolean }[] }>("/tahsin/points"), retry: false });
  const q = useQuery({ queryKey: ["tahsin-cur", point, prefs.reciterId], queryFn: () => api<Cur>(`/tahsin/curriculum/${point}?reciter_id=${encodeURIComponent(prefs.reciterId)}`) });
  const items = q.data?.items ?? [];
  const total = items.length;
  // Urutan latihan ada di alamat (?o=3,1,5&n=0) supaya tetap sama saat halaman dimuat ulang.
  const order = useMemo(() => (sp.get("o") ?? "").split(",").map(Number).filter((n) => Number.isInteger(n) && n >= 1), [sp]);
  const n = Math.max(0, Number(sp.get("n") ?? 0));
  const start = (first?: number) => {
    const all = items.map((x) => x.index);
    const rest = shuffle(first ? all.filter((x) => x !== first) : all);
    nav(`/tahsin/${point}?o=${(first ? [first, ...rest] : rest).slice(0, SESSION).join(",")}&n=0`);
  };

  if (q.isError) return <div className="space-y-3 p-8 text-center"><p className="font-extrabold">Pulau tidak ditemukan.</p><button type="button" className="font-extrabold text-brand" onClick={() => nav("/tahsin")}>Kembali ke peta</button></div>;
  if (!q.data) return <p className="p-8 text-center font-extrabold text-muted">Memuat…</p>;

  // Langkah 0: pilih huruf yang ingin dilatih, atau biarkan acak.
  if (!order.length) {
    return (
      <div className="space-y-4 px-4 pb-10 pt-3">
        <div className="flex items-center gap-3">
          <button type="button" aria-label="Kembali" onClick={() => nav("/tahsin")} className="-ml-2 flex h-11 w-11 items-center justify-center text-brand">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg>
          </button>
          <p className="text-lg font-extrabold text-brand-dark">Pulau {point} · {total} latihan</p>
        </div>
        <div className="flex items-center gap-3">
          <Mascot mood="happy" size={64} />
          <p className="flex-1 rounded-[24px] bg-brand p-4 text-lg font-extrabold text-white">Pilih huruf yang mau dilatih, atau biarkan acak.</p>
        </div>
        <UjianCard point={Number(point)} passed={!!pts.data?.points.find((x) => x.point === Number(point))?.passed} onStart={() => nav(`/tahsin/${point}/ujian`)} />
        <p className="text-sm font-extrabold text-brand-dark">Latihan (tidak dikirim ke penilai)</p>
        <button type="button" onClick={() => start()} className="btn-cta">🎲 Acak latihan</button>
        <ul className={`grid gap-3 ${total > 10 ? "grid-cols-3" : "grid-cols-2"}`}>
          {items.map((x) => (
            <li key={x.index}>
              <button type="button" onClick={() => start(x.index)} className={`flex w-full flex-col ${total > 10 ? "min-h-[104px]" : "min-h-[132px]"} items-center justify-center gap-1 rounded-[24px] bg-teal px-2 py-3 text-white`} aria-label={`Latih ${x.title}`}>
                <FocusArabic text={x.arabic} focus={focusOf(x)} color={FOCUS_COLOR} style={{ fontSize: arabSize(x.arabic, true) }} />
                <span className={`font-extrabold ${total > 10 ? "text-xs" : "text-sm"}`}>{x.title}</span>
              </button>
            </li>
          ))}
        </ul>
        <p className="text-center text-sm font-bold text-muted">Huruf berwarna kuning adalah yang dinilai.</p>
      </div>
    );
  }

  const pos = Math.min(n, order.length - 1);
  const it = items.find((x) => x.index === order[pos]);
  if (!it) return <p className="p-8 text-center font-extrabold text-muted">Memuat…</p>;
  const steps = order.length;

  // Putar kata contoh satu per satu (kata pendek yang memuat huruf). Bila sumber utama gagal,
  // coba sumber cadangan, lalu seluruh ayat contoh.
  const listen = (rate: number) => {
    const el = audio.current ?? (audio.current = new Audio());
    el.pause();
    const run = ++token.current;
    const chain = [it.audio_urls ?? [], it.audio_fallback_urls ?? [], [it.audio_url]].filter((l) => l.length);
    const playList = (ci: number) => {
      const list = chain[ci];
      if (!list) { setPlaying(false); return; }
      let k = 0;
      const step = () => {
        if (run !== token.current) return;
        if (k >= list.length) { setPlaying(false); return; }
        el.src = list[k++];
        el.playbackRate = rate;
        el.onended = step;
        el.onerror = () => { if (run === token.current) playList(ci + 1); };
        void el.play().then(() => setPlaying(true)).catch(() => { if (run === token.current) playList(ci + 1); });
      };
      step();
    };
    playList(0);
  };
  const last = pos + 1 >= steps;
  // Latihan tidak dikirim ke penilai. Setelah latihan terakhir, kembali ke Pulau ini untuk ujiannya.
  const nextPath = last ? `/tahsin/${point}` : `/tahsin/${point}?o=${order.join(",")}&n=${pos + 1}`;
  const go = () => {
    token.current++;
    audio.current?.pause();
    nav(nextPath);
  };
  return (
    <div className="space-y-4 px-4 pb-10 pt-3">
      <div className="flex items-center gap-3">
        <button type="button" aria-label="Tutup" onClick={() => nav(`/tahsin/${point}`)} className="-ml-2 flex h-11 w-11 items-center justify-center text-brand">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </button>
        <div className="flex-1">
          <div className="flex gap-2" role="progressbar" aria-valuemin={1} aria-valuemax={steps} aria-valuenow={pos + 1} aria-label={`Latihan ${pos + 1} dari ${steps}`}>
            {order.map((_, k) => <span key={k} className={`h-3.5 flex-1 rounded-pill ${k <= pos ? "bg-teal" : "bg-lav"}`} />)}
          </div>
          <p className="mt-1 text-sm font-extrabold text-brand-dark">Pulau {point} · Latihan {pos + 1} dari {steps}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Mascot mood="happy" size={64} />
        <p className="flex-1 rounded-[24px] bg-brand p-4 text-lg font-extrabold text-white">Dengarkan dulu, lalu tirukan ya! Ini latihan.</p>
      </div>

      <div className="rounded-[32px] bg-teal px-4 py-8 text-center text-white">
        <FocusArabic text={it.arabic} focus={focusOf(it)} color={FOCUS_COLOR} className="block" style={{ fontSize: arabSize(it.arabic) }} />
        <p className="mt-2 text-2xl font-extrabold">{it.title}</p>
        {it.versus && <p className="font-bold opacity-90">Bandingkan dengan huruf {it.versus}</p>}
        <p className="mt-2 text-sm font-bold opacity-90"><span style={{ color: FOCUS_COLOR }}>●</span> Huruf berwarna kuning adalah yang dinilai</p>
      </div>

      <div className="rounded-[24px] bg-brand-light p-4">
        {it.articulation && <MouthDiagram kind={it.articulation} />}
        <p className="mt-2 text-center font-extrabold text-brand-dark">{it.tip}</p>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-2 text-center">
        <button type="button" onClick={() => { setSlow(false); listen(1); }} className="flex flex-col items-center gap-1 font-extrabold text-brand-dark" aria-label="Dengar contoh bacaan">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-lav text-brand">{playing && !slow ? "…" : <NavPlay size={28} />}</span>Dengar
        </button>
        <button type="button" onClick={go} className="flex flex-col items-center gap-1 font-extrabold text-brand-dark" aria-label={last ? "Selesai latihan" : "Latihan berikutnya"}>
          <span className="flex h-28 w-28 items-center justify-center rounded-full bg-brand text-white ring-8 ring-lav"><NavPlay size={52} /></span>{last ? "Selesai latihan" : "Lanjut"}
        </button>
        <button type="button" onClick={() => { setSlow(true); listen(0.6); }} className="flex flex-col items-center gap-1 font-extrabold text-brand-dark" aria-label="Dengar pelan">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-lav text-brand">{playing && slow ? "…" : "🐢"}</span>Pelan
        </button>
      </div>
      <p className="text-center text-xs font-bold text-muted">Ini hanya latihan: tirukan sambil mendengar, tidak ada yang dikirim. Setelah selesai, ikuti ujian Pulau untuk dinilai guru atau orang tua.</p>
    </div>
  );
}
