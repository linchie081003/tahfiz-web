import { createContext, useCallback, useContext, useState } from "react";
import { GameCard } from "./GameCard";

type Toast = { id: number; message: string };

const ToastCtx = createContext<(msg: string) => void>(() => {});

export function GameToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const show = useCallback((message: string) => {
    const id = Date.now();
    setToasts((t) => [...t, { id, message }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  }, []);

  return (
    <ToastCtx.Provider value={show}>
      {children}
      <div className="pointer-events-none fixed bottom-4 left-1/2 z-[100] flex w-full max-w-game -translate-x-1/2 flex-col gap-2 px-4">
        {toasts.map((t) => (
          <GameCard key={t.id} className="pointer-events-auto border-brand bg-brand-light text-sm font-bold text-outline shadow-game">
            {t.message}
          </GameCard>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export function useGameToast() {
  return useContext(ToastCtx);
}
