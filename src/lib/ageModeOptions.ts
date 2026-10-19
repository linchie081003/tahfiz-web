import type { AgeMode } from "../context/AgeModeContext";

export const AGE_MODE_OPTIONS: { value: AgeMode; label: string }[] = [
  { value: "paud", label: "PAUD (pra-SD)" },
  { value: "sd", label: "SD" },
  { value: "teen", label: "Remaja (SMP–SMA)" },
  { value: "adult", label: "Dewasa" },
];

export function ageModeLabel(mode: string): string {
  return AGE_MODE_OPTIONS.find((o) => o.value === mode)?.label ?? mode;
}
