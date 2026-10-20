import { useEffect, useState } from "react";
import { getToken } from "../lib/api";

type Props = {
  url: string;
  className?: string;
};

export function AuthenticatedAudio({ url, className }: Props) {
  const [src, setSrc] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let blobUrl: string | null = null;
    let cancelled = false;

    (async () => {
      setError(null);
      setSrc(null);
      const token = getToken();
      try {
        const res = await fetch(url, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) {
          if (!cancelled) setError(`Rekaman tidak dapat dimuat (${res.status}).`);
          return;
        }
        const blob = await res.blob();
        if (blob.size === 0) {
          if (!cancelled) setError("File rekaman kosong.");
          return;
        }
        blobUrl = URL.createObjectURL(blob);
        if (!cancelled) setSrc(blobUrl);
      } catch {
        if (!cancelled) setError("Gagal memuat rekaman. Periksa koneksi ke API.");
      }
    })();

    return () => {
      cancelled = true;
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [url]);

  if (error) {
    return (
      <p className="rounded-game border-2 border-game-coral/50 bg-game-coral/10 p-2 text-xs font-semibold text-outline">
        {error}
      </p>
    );
  }
  if (!src) {
    return <p className="text-xs font-semibold text-outline/70">Memuat rekaman…</p>;
  }
  return <audio controls src={src} className={className} preload="metadata" />;
}
