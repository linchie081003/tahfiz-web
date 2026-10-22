import type { ReactNode } from "react";

export function GameCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`game-card rounded-card bg-brand-light p-4 ${className}`}>{children}</div>;
}
