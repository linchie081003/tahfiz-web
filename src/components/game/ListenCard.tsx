import { useEffect, useRef, useState } from "react";

/** Kartu "Dengarkan dulu": putar contoh bacaan ayat berurutan. */
export function ListenCard({ urls, caption }: { urls: string[]; caption: string }) {
  const ref = useRef<HTMLAudioElement | null>(null);
  const idx = useRef(0);
  const [playing, setPlaying] = useState(false);
  const [rate, setRate] = useState(1);
  const key = urls.join("|");

  useEffect(() => {
    ref.current?.pause();
    idx.current = 0;
    setPlaying(false);
  }, [key]);
  useEffect(() => () => ref.current?.pause(), []);

  if (!urls.length) return null;

  const playCurrent = () => {
    const a = ref.current ?? (ref.current = new Audio());
    a.src = urls[idx.current];
    a.playbackRate = rate;
    a.onended = () => {
      if (idx.current + 1 < urls.length) {
        idx.current += 1;
        playCurrent();
      } else {
        idx.current = 0;
        setPlaying(false);
      }
    };
    a.onerror = () => setPlaying(false);
    void a.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  };
  const toggle = () => {
    if (playing) {
      ref.current?.pause();
      setPlaying(false);
    } else playCurrent();
  };
  const cycle = () => {
    const next = rate === 1 ? 0.75 : rate === 0.75 ? 0.5 : 1;
    setRate(next);
    if (ref.current) ref.current.playbackRate = next;
  };

  return (
    <div className="flex items-center gap-3 rounded-[22px] border-[4px] border-line bg-white p-3 shadow-game">
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? "Jeda contoh bacaan" : "Putar contoh bacaan"}
        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-4 border-line bg-gradient-to-b from-game-green-start to-game-green-end shadow-game-sm active:translate-y-[2px]"
      >
        {playing ? (
          <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
            <path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" fill="#fff" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
            <path d="M8 5l11 7-11 7z" fill="#fff" />
          </svg>
        )}
      </button>
      <div className="min-w-0 flex-1">
        <p className="text-base font-extrabold text-outline">Dengarkan dulu</p>
        <p className="text-xs font-semibold text-outline/70">{caption}</p>
      </div>
      <button
        type="button"
        onClick={cycle}
        aria-label={`Kecepatan ${rate} kali`}
        className="rounded-game border-2 border-line bg-[#EAF6FF] px-2.5 py-1 text-sm font-extrabold text-outline"
      >
        {rate}×
      </button>
    </div>
  );
}
