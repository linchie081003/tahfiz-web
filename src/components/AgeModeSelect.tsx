import { AGE_MODE_OPTIONS } from "../lib/ageModeOptions";
import type { AgeMode } from "../context/AgeModeContext";

export function AgeModeSelect({
  value,
  onChange,
  disabled,
  className = "w-full rounded-xl border p-2",
  id,
}: {
  value: AgeMode;
  onChange: (mode: AgeMode) => void;
  disabled?: boolean;
  className?: string;
  id?: string;
}) {
  return (
    <select
      id={id}
      className={className}
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value as AgeMode)}
    >
      {AGE_MODE_OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
