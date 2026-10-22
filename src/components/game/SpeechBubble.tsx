export function SpeechBubble({ children, compact }: { children: React.ReactNode; compact?: boolean }) {
  return (
    <div className={`rounded-card bg-cream ${compact ? "px-3 py-2" : "px-4 py-3"}`}>
      <p className={`font-bold text-outline ${compact ? "text-xs" : "text-sm"}`}>{children}</p>
    </div>
  );
}
