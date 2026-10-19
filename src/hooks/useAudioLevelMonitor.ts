import { useEffect, useState } from "react";

/** RMS time-domain — lebih sensitif untuk suara bicara daripada rata-rata spektrum. */
const VOICE_RMS_THRESHOLD = 0.018;

function rmsFromTimeDomain(analyser: AnalyserNode, buf: Uint8Array<ArrayBuffer>): number {
  analyser.getByteTimeDomainData(buf);
  let sum = 0;
  for (let i = 0; i < buf.length; i++) {
    const v = (buf[i]! - 128) / 128;
    sum += v * v;
  }
  return Math.sqrt(sum / buf.length);
}

function peakVoiceBand(analyser: AnalyserNode, buf: Uint8Array<ArrayBuffer>): number {
  analyser.getByteFrequencyData(buf);
  const end = Math.min(buf.length, 120);
  let peak = 0;
  for (let i = 2; i < end; i++) {
    if (buf[i]! > peak) peak = buf[i]!;
  }
  return peak / 255;
}

export function useAudioLevelMonitor(stream: MediaStream | null, active: boolean) {
  const [level, setLevel] = useState(0);
  const [hasVoice, setHasVoice] = useState(false);
  const [micLive, setMicLive] = useState(false);

  useEffect(() => {
    if (!stream || !active) {
      setLevel(0);
      setHasVoice(false);
      setMicLive(false);
      return;
    }

    const track = stream.getAudioTracks()[0];
    if (!track) {
      setMicLive(false);
      return;
    }

    let cancelled = false;
    let raf = 0;
    const AudioCtx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioCtx();
    const source = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0.65;
    source.connect(analyser);

    const timeBuf = new Uint8Array(analyser.fftSize);
    const freqBuf = new Uint8Array(analyser.frequencyBinCount);

    const tick = () => {
      if (cancelled) return;
      const live = track.readyState === "live" && track.enabled && !track.muted;
      setMicLive(live);

      const rms = rmsFromTimeDomain(analyser, timeBuf);
      const peak = peakVoiceBand(analyser, freqBuf);
      const combined = Math.min(1, Math.max(rms * 4, peak * 1.2));
      setLevel(combined);
      setHasVoice(rms >= VOICE_RMS_THRESHOLD || peak >= 0.08);
      raf = requestAnimationFrame(tick);
    };

    void (async () => {
      try {
        if (ctx.state === "suspended") await ctx.resume();
      } catch {
        /* ignore */
      }
      if (!cancelled) raf = requestAnimationFrame(tick);
    })();

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      source.disconnect();
      void ctx.close();
    };
  }, [stream, active]);

  return { level, hasVoice, micLive };
}
