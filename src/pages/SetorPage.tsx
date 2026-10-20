import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { RecordingLevelMeter } from "../components/game/RecordingLevelMeter";
import { useAudioLevelMonitor } from "../hooks/useAudioLevelMonitor";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArabicAyahText } from "../components/ArabicAyahText";
import { GameButton } from "../components/game/GameButton";
import { GameCard } from "../components/game/GameCard";
import { friendlyError, useGameToast } from "../components/game/GameToast";
import { Mascot } from "../components/game/Mascot";
import { IconBack, IconMic } from "../components/icons/GameIcons";
import { api } from "../lib/api";
import { AppPage, PageTitleRow } from "../components/layout/AppPage";
import { mergeAyahRange, type AyahLine } from "../lib/ayahDisplay";
import { loadQuranPrefs } from "../lib/quranPrefs";

export function SetorPage() {
  const [params] = useSearchParams();
  const context = params.get("context") ?? "ziyadah";
  const fallbackText = params.get("text") ?? "";
  const surahIdParam = params.get("surah_id");
  const surahId = surahIdParam ? Number(surahIdParam) : null;
  const ayahStart = Number(params.get("ayah_start") ?? 1);
  const ayahEnd = Number(params.get("ayah_end") ?? ayahStart);
  const nav = useNavigate();
  const toast = useGameToast();
  const prefs = loadQuranPrefs();
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const [recording, setRecording] = useState(false);
  const [liveStream, setLiveStream] = useState<MediaStream | null>(null);
  const [lastCaptureOk, setLastCaptureOk] = useState<boolean | undefined>(undefined);
  const [blob, setBlob] = useState<Blob | null>(null);
  const { level, hasVoice, micLive } = useAudioLevelMonitor(liveStream, recording);
  const voiceHeardRef = useRef(false);

  useEffect(() => {
    if (recording && hasVoice) voiceHeardRef.current = true;
  }, [recording, hasVoice]);
  const startedAt = useRef(0);
  const [durationSec, setDurationSec] = useState(0);
  const [busy, setBusy] = useState(false);
  const [micDenied, setMicDenied] = useState(false);

  const session = useQuery({
    queryKey: ["session"],
    queryFn: () => api<{ role: string; member_id?: string | null }>("/auth/session"),
  });
  const needsProfile = session.data?.role === "parent" && !session.data.member_id;

  const ayahsQ = useQuery({
    queryKey: ["ayahs", surahId, prefs.reciterId],
    queryFn: () => api<AyahLine[]>(`/quran/surahs/${surahId}/ayahs?reciter_id=${prefs.reciterId}`),
    enabled: surahId != null && !Number.isNaN(surahId),
  });

  const display = useMemo(() => {
    if (ayahsQ.data?.length) return mergeAyahRange(ayahsQ.data, ayahStart, ayahEnd);
    return { textUthmani: fallbackText, textTajweed: null as string | null };
  }, [ayahsQ.data, ayahStart, ayahEnd, fallbackText]);

  const referenceText = display.textUthmani || fallbackText;

  const blobUrl = useMemo(() => (blob ? URL.createObjectURL(blob) : null), [blob]);
  useEffect(() => () => { if (blobUrl) URL.revokeObjectURL(blobUrl); }, [blobUrl]);

  const start = async () => {
    try {
      setMicDenied(false);
      setBlob(null);
      setLastCaptureOk(undefined);
      voiceHeardRef.current = false;
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      const track = stream.getAudioTracks()[0];
      if (!track) throw new Error("Tidak ada track audio");

      setLiveStream(stream);
      setRecording(true);

      const mime =
        typeof MediaRecorder !== "undefined" &&
        MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
          ? "audio/webm;codecs=opus"
          : undefined;
      const rec = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
      chunks.current = [];
      rec.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.current.push(e.data);
      };
      rec.onstop = () => {
        const b = new Blob(chunks.current, { type: rec.mimeType || "audio/webm" });
        setBlob(b);
        setDurationSec(Math.round((Date.now() - startedAt.current) / 1000));
        const heard = voiceHeardRef.current || b.size > 3000;
        setLastCaptureOk(heard);
        stream.getTracks().forEach((t) => t.stop());
        setLiveStream(null);
      };
      mediaRef.current = rec;
      startedAt.current = Date.now();
      rec.start(250);
    } catch {
      setMicDenied(true);
      toast("Izin mikrofon ditolak. Aktifkan di pengaturan browser.", "error");
    }
  };

  const stop = () => {
    const rec = mediaRef.current;
    if (rec && rec.state !== "inactive") rec.stop();
    setRecording(false);
  };

  const submit = async () => {
    if (!blob) return;
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("context", context);
      fd.append("reference_text", referenceText);
      if (surahId != null && !Number.isNaN(surahId)) {
        fd.append("surah_id", String(surahId));
        fd.append("ayah_start", String(ayahStart));
        fd.append("ayah_end", String(ayahEnd));
      }
      fd.append("file", blob, "rec.webm");
      await api("/setor", { method: "POST", body: fd });
      toast("Setoran terkirim! Menunggu penilaian orang tua.", "success");
      nav("/");
    } catch (e) {
      toast(friendlyError(e), "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppPage>
      <button type="button" onClick={() => nav(-1)} className="flex items-center gap-1 font-bold text-outline underline">
        <IconBack size={24} decorative /> Kembali
      </button>
      <PageTitleRow>
        <h1 className="text-xl font-extrabold text-outline">Setoran</h1>
      </PageTitleRow>

      {needsProfile && (
        <GameCard className="space-y-2 bg-brand-light">
          <p className="text-sm font-bold text-outline">
            Setoran perlu profil anak agar progress tersimpan. Anda tetap bisa latihan di Tahsin/Ziyadah tanpa setor.
          </p>
          <Link to="/pilih-profil" className="inline-block font-bold text-brand underline">
            Pilih profil anak
          </Link>
        </GameCard>
      )}

      <GameCard>
        {ayahsQ.isLoading && surahId ? (
          <p className="text-sm font-semibold text-outline">Memuat teks ayat…</p>
        ) : (
          <ArabicAyahText textUthmani={referenceText} textTajweed={display.textTajweed} />
        )}
      </GameCard>

      {micDenied && (
        <GameCard className="flex items-center gap-3 bg-brand-light">
          <Mascot mood="sad" size={64} />
          <p className="text-sm font-bold text-outline">Mikrofon belum diizinkan. Minta orang tua bantu buka izin di browser.</p>
        </GameCard>
      )}

      <RecordingLevelMeter
        level={level}
        active={recording}
        hasVoice={hasVoice}
        micLive={recording ? micLive : undefined}
        capturedOk={!recording ? lastCaptureOk : undefined}
      />

      {!recording ? (
        <GameButton variant="danger" disabled={needsProfile} onClick={() => void start()}>
          <span className="inline-flex items-center justify-center gap-2">
            <IconMic size={28} decorative /> Rekam
          </span>
        </GameButton>
      ) : (
        <GameButton variant="gold" onClick={stop}>
          Berhenti
        </GameButton>
      )}

      {blob && (
        <>
          <audio controls src={blobUrl ?? undefined} className="w-full rounded-game border-[3px] border-outline" />
          <GameCard className="space-y-1 bg-brand-light text-sm font-bold text-outline">
            <p>Cek rekaman</p>
            <p className="font-semibold">
              {lastCaptureOk ? "✓ Suara terdengar" : "⚠ Suara hampir tidak terdengar. Coba rekam lagi lebih dekat ke mikrofon."} ·
              durasi {durationSec} detik
            </p>
            <p className="text-xs font-semibold text-outline/70">Rekaman hanya dikirim ke orang tuamu. Penilaian dilakukan orang tua.</p>
          </GameCard>
          <GameButton disabled={busy} onClick={() => void submit()}>
            Kirim setoran
          </GameButton>
        </>
      )}
    </AppPage>
  );
}
