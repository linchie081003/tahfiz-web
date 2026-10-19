import { ArabicAyahText } from "./ArabicAyahText";
import { QuranAudioPlayer } from "./QuranAudioPlayer";

export type QuranAyah = {
  ayah_number: number;
  text_uthmani: string;
  text_tajweed?: string | null;
  audio_url: string | null;
};

export function QuranAyahBlock({
  ayah,
  showAudio = true,
  active = false,
  blockId,
}: {
  ayah: QuranAyah;
  showAudio?: boolean;
  active?: boolean;
  blockId?: string;
}) {
  return (
    <article
      id={blockId}
      className={`card-surface space-y-3 p-4 transition ${active ? "ring-2 ring-purple-500 ring-offset-2 ring-offset-primary" : ""}`}
    >
      <div className="flex items-start gap-3">
        <span
          className="flex h-9 min-w-9 shrink-0 items-center justify-center rounded-full bg-purple-100 text-sm font-extrabold text-purple-900"
          aria-hidden
        >
          {ayah.ayah_number}
        </span>
        <div className="min-w-0 flex-1">
          <ArabicAyahText textUthmani={ayah.text_uthmani} textTajweed={ayah.text_tajweed} />
        </div>
      </div>
      {showAudio && ayah.audio_url && <QuranAudioPlayer src={ayah.audio_url} />}
    </article>
  );
}
