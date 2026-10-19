export function SpeechBubble({ children, compact }: { children: React.ReactNode; compact?: boolean }) {
  if (compact) {
    return (
      <div className="rounded-game border-2 border-outline/50 bg-white/90 px-2.5 py-1.5">
        <p className="text-xs font-bold leading-snug text-outline">{children}</p>
      </div>
    );
  }
  return (
    <div className="relative rounded-card border-[3px] border-outline bg-white px-4 py-3 shadow-game">
      <p className="text-sm font-bold text-outline">{children}</p>
      <div className="absolute -bottom-2 left-8 h-4 w-4 rotate-45 border-b-[3px] border-r-[3px] border-outline bg-white" aria-hidden />
    </div>
  );
}
