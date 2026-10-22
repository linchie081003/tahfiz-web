type Props = { label: string; value: number; onChange: (n: number) => void };

export function StarRating({ label, value, onChange }: Props) {
  return (
    <div className="flex items-center justify-between gap-2" role="radiogroup" aria-label={label}>
      <span className="text-sm font-extrabold text-outline">{label}</span>
      <span className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            aria-label={`${label} ${n} dari 5`}
            onClick={() => onChange(value === n ? 0 : n)}
            className="flex h-11 w-11 items-center justify-center"
          >
            <svg viewBox="0 0 24 24" width="34" height="34" aria-hidden="true">
              <path
                d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"
                fill={n <= value ? "#F2B01E" : "#E6E4F8"}
                stroke={n <= value ? "#C98A00" : "#CFCBEF"}
                strokeWidth="1.4"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        ))}
      </span>
    </div>
  );
}
