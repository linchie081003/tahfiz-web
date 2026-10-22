import { useEffect, useMemo, useRef, useState } from "react";
import { useQuranPrefs } from "../lib/quranPrefs";

type Props = {
  src?: string | null;
  sources?: (string | null | undefined)[];
  label?: string;
  tone?: "light" | "dark";
  onTrackIndexChange?: (index: number) => void;
};

export function QuranAudioPlayer({ src, sources, label, tone = "dark", onTrackIndexChange }: Props) {
  const ref = useRef<HTMLAudioElement>(null);
  const onTrackRef = useRef(onTrackIndexChange);
  onTrackRef.current = onTrackIndexChange;
  const prefs = useQuranPrefs();
  const playlist = useMemo(
    () => (sources?.filter((u): u is string => Boolean(u)) ?? (src ? [src] : [])),
    [src, sources],
  );
  const [index, setIndex] = useState(0);
  const continuePlaylist = useRef(false);
  const current = playlist[index] ?? null;
  const playlistKey = playlist.join("|");

  useEffect(() => {
    setIndex(0);
    continuePlaylist.current = false;
    onTrackRef.current?.(0);
  }, [playlistKey]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.playbackRate = prefs.playbackSpeed;
    if (continuePlaylist.current) {
      continuePlaylist.current = false;
      void el.play().catch(() => {});
    }
  }, [current, prefs.playbackSpeed]);

  if (!current) return null;

  const multi = playlist.length > 1;
  const metaClass = tone === "light" ? "text-gray-600" : "text-muted";
  const labelClass = tone === "light" ? "text-gray-900" : "text-outline";

  const advance = () => {
    if (index + 1 >= playlist.length) return;
    continuePlaylist.current = true;
    const next = index + 1;
    setIndex(next);
    onTrackRef.current?.(next);
  };

  return (
    <div className="space-y-1">
      {label && <p className={`text-sm font-semibold ${labelClass}`}>{label}</p>}
      <audio
        ref={ref}
        key={current}
        controls
        src={current}
        className="w-full"
        preload="metadata"
        onEnded={advance}
      />
      {multi && (
        <p className={`text-xs ${metaClass}`}>
          Ayat {index + 1} dari {playlist.length} · lanjut otomatis ke ayat berikutnya
        </p>
      )}
      <p className={`text-xs ${metaClass}`}>Kecepatan: {prefs.playbackSpeed}x · ubah di Pengaturan</p>
    </div>
  );
}
