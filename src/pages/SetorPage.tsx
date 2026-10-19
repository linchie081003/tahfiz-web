import { useQuery } from "@tanstack/react-query";
import { useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArabicAyahText } from "../components/ArabicAyahText";
import { api } from "../lib/api";
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
  const prefs = loadQuranPrefs();
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const [recording, setRecording] = useState(false);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [busy, setBusy] = useState(false);

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

  const start = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const rec = new MediaRecorder(stream);
    chunks.current = [];
    rec.ondataavailable = (e) => chunks.current.push(e.data);
    rec.onstop = () => {
      const b = new Blob(chunks.current, { type: "audio/webm" });
      setBlob(b);
      stream.getTracks().forEach((t) => t.stop());
    };
    mediaRef.current = rec;
    rec.start();
    setRecording(true);
  };

  const stop = () => {
    mediaRef.current?.stop();
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
      alert("Setoran terkirim! Menunggu penilaian orang tua.");
      nav("/");
    } catch (e) {
      alert(String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4 p-4">
      <button type="button" onClick={() => nav(-1)} className="text-white underline">
        ← Kembali
      </button>
      <div className="card-surface p-4">
        {ayahsQ.isLoading && surahId ? (
          <p className="text-sm text-gray-600">Memuat teks ayat…</p>
        ) : (
          <ArabicAyahText textUthmani={referenceText} textTajweed={display.textTajweed} />
        )}
      </div>
      <p className="text-sm text-white/90">Dengar contoh di Ziyadah/Tahsin jika perlu; rekam bacaan Anda di sini.</p>
      {!recording ? (
        <button type="button" className="btn-cta" onClick={start}>
          🎤 Rekam
        </button>
      ) : (
        <button type="button" className="btn-cta bg-red-500" onClick={stop}>
          ⏹ Berhenti
        </button>
      )}
      {blob && (
        <>
          <audio controls src={URL.createObjectURL(blob)} className="w-full" />
          <button type="button" className="btn-cta" disabled={busy} onClick={submit}>
            Kirim setoran
          </button>
        </>
      )}
    </div>
  );
}
