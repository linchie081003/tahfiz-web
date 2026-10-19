type Props = {
  level: number;
  active: boolean;
  hasVoice: boolean;
  micLive?: boolean;
  /** Setelah stop: apakah ada suara yang pernah terdeteksi */
  capturedOk?: boolean;
};

export function RecordingLevelMeter({ level, active, hasVoice, micLive, capturedOk }: Props) {
  if (!active && capturedOk === undefined) return null;

  const bars = Array.from({ length: 10 }, (_, i) => {
    const wave = 0.55 + ((i * 17) % 10) / 14;
    const boosted = Math.min(1, level * 1.1);
    const raw = active ? boosted * wave : capturedOk ? 0.35 + wave * 0.25 : 0.12;
    const minH = active && micLive ? 10 : 6;
    return Math.round(Math.min(52, Math.max(minH, raw * 52)));
  });

  let status = "Siap rekam";
  let tone = "border-outline/30 bg-white/90 text-outline/80";

  if (active && hasVoice) {
    status = "Suara masuk — lanjutkan bacaan";
    tone = "border-game-green-end/50 bg-gradient-to-r from-game-green-start/40 to-white text-outline";
  } else if (active && micLive === false) {
    status = "Mikrofon belum aktif — cek izin browser";
    tone = "border-game-coral/50 bg-game-coral/15 text-outline";
  } else if (active && level > 0.03) {
    status = "Suara lemah — dekatkan ke mic & bicara lebih keras";
    tone = "border-game-orange/50 bg-gradient-to-r from-game-gold-start/40 to-white text-outline";
  } else if (active) {
    status = "Mendengarkan… bacalah ke mikrofon";
    tone = "border-brand/40 bg-gradient-to-r from-brand-light/80 to-white text-outline";
  } else if (capturedOk === true) {
    status = "Suara tercatat — dengarkan lalu kirim";
    tone = "border-game-green-end/50 bg-white text-outline";
  } else if (capturedOk === false) {
    status = "Hampir tidak ada suara — coba rekam lagi";
    tone = "border-game-coral/50 bg-game-coral/15 text-outline";
  }

  return (
    <div className={`rounded-card border-[3px] p-4 shadow-game-sm ${tone}`} role="status" aria-live="polite">
      <div className="flex items-end justify-center gap-1.5" aria-hidden>
        {bars.map((h, i) => (
          <div
            key={i}
            className={`w-2.5 rounded-full border border-outline/20 transition-[height] duration-75 ${
              active && hasVoice
                ? "bg-gradient-to-t from-game-green-end to-game-green-start"
                : active
                  ? "bg-brand"
                  : capturedOk
                    ? "bg-game-green-start/80"
                    : "bg-game-locked"
            }`}
            style={{ height: `${h}px` }}
          />
        ))}
      </div>
      <p className="mt-3 text-center text-sm font-extrabold">{status}</p>
      {active && (
        <p className="mt-1 text-center text-[10px] font-semibold text-outline/70">
          {micLive === false
            ? "○ Mikrofon tidak terhubung"
            : hasVoice
              ? "● Suara masuk ke mikrofon"
              : micLive
                ? "○ Mikrofon siap — belum ada suara"
                : "○ Menghubungkan mikrofon…"}
        </p>
      )}
    </div>
  );
}
