export function GameTabs<T extends string>({
  tabs,
  value,
  onChange,
}: {
  tabs: { id: T; label: string }[];
  value: T;
  onChange: (id: T) => void;
}) {
  return (
    <div className="flex rounded-pill border-[3px] border-outline bg-brand-light p-1 shadow-game-sm" role="tablist">
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          role="tab"
          aria-selected={value === t.id}
          className={`flex-1 rounded-pill px-2 py-2 text-xs font-extrabold sm:text-sm ${
            value === t.id ? "bg-brand text-white shadow-game-sm" : "text-outline"
          }`}
          onClick={() => onChange(t.id)}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
