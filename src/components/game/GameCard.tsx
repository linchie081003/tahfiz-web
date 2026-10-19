import type { ReactNode } from "react";

export function GameCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`game-card rounded-card border-[3px] border-outline bg-white p-4 shadow-game ${className}`}>
      {children}
    </div>
  );
}
