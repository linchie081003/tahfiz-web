import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { GameButton } from "./GameButton";

export type ConfirmOptions = {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "primary" | "gold";
};
type Pending = ConfirmOptions & { resolve: (ok: boolean) => void };
type Confirm = (opts: ConfirmOptions) => Promise<boolean>;

const DialogCtx = createContext<Confirm>(() => Promise.resolve(false));

export function GameDialogProvider({ children }: { children: React.ReactNode }) {
  const [pending, setPending] = useState<Pending | null>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  const confirm = useCallback<Confirm>(
    (opts) => new Promise<boolean>((resolve) => setPending({ ...opts, resolve })),
    [],
  );
  const close = (ok: boolean) => {
    pending?.resolve(ok);
    setPending(null);
  };

  useEffect(() => {
    if (!pending) return;
    cancelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pending]);

  return (
    <DialogCtx.Provider value={confirm}>
      {children}
      {pending && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-outline/60 px-5"
          onClick={() => close(false)}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="gd-title"
            className="game-card w-full max-w-[340px] rounded-card border-[3px] border-outline bg-white p-5 text-center shadow-game"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="gd-title" className="text-xl font-extrabold text-outline">
              {pending.title}
            </h2>
            {pending.message && <p className="mt-2 text-sm font-semibold leading-snug text-outline/70">{pending.message}</p>}
            <div className="mt-4 flex gap-3">
              <button
                ref={cancelRef}
                type="button"
                onClick={() => close(false)}
                className="min-h-[44px] flex-1 rounded-pill border-[3px] border-outline bg-gradient-to-b from-[#E4E7F0] to-[#C9CEDC] text-sm font-extrabold uppercase text-outline shadow-game-sm active:translate-y-[2px]"
              >
                {pending.cancelLabel ?? "Batal"}
              </button>
              <GameButton
                size="md"
                variant={pending.tone === "danger" ? "danger" : pending.tone === "gold" ? "gold" : "primary"}
                className="flex-1"
                onClick={() => close(true)}
              >
                {pending.confirmLabel ?? "Ya"}
              </GameButton>
            </div>
          </div>
        </div>
      )}
    </DialogCtx.Provider>
  );
}

export function useGameConfirm() {
  return useContext(DialogCtx);
}
