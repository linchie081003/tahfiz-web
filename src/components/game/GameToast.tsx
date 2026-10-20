import { createContext, useCallback, useContext, useState } from "react";

export type ToastKind = "info" | "success" | "error";
type Toast = { id: number; message: string; kind: ToastKind };
type Show = (msg: string, kind?: ToastKind) => void;

const ToastCtx = createContext<Show>(() => {});

const KIND_CLASS: Record<ToastKind, string> = {
  info: "from-[#4DB8FF] to-[#2D8CFF]",
  success: "from-game-green-start to-game-green-end",
  error: "from-[#FF7A8C] to-[#FF4D6D]",
};

export function GameToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const show = useCallback<Show>((message, kind = "info") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t.slice(-2), { id, message, kind }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), kind === "error" ? 6000 : 3500);
  }, []);

  return (
    <ToastCtx.Provider value={show}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed bottom-4 left-1/2 z-[100] flex w-full max-w-game -translate-x-1/2 flex-col gap-2 px-4"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex min-h-[48px] items-center justify-center rounded-pill border-[3px] border-outline bg-gradient-to-b px-4 py-2 text-center text-sm font-extrabold text-white shadow-game game-text-stroke ${KIND_CLASS[t.kind]}`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export function useGameToast() {
  return useContext(ToastCtx);
}

/** Ubah error apa pun menjadi pesan ramah (tanpa "Error: ..." mentah). */
export function friendlyError(e: unknown): string {
  const raw = e instanceof Error ? e.message : String(e);
  const m = raw.match(/"detail"\s*:\s*"([^"]+)"/);
  return m ? m[1] : raw.replace(/^Error:\s*/, "") || "Terjadi kesalahan, coba lagi.";
}
