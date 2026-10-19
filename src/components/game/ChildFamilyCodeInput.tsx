import { useState } from "react";
import { AccessCodeInput } from "./AccessCodeInput";
import { NumericPinPad } from "./NumericPinPad";
import {
  LEGACY_FAMILY_CODE_LEN,
  NEW_FAMILY_CODE_LEN,
  detectCodeEntryMode,
  normalizeFamilyCode,
} from "../../lib/familyCode";

type Props = {
  value: string;
  onChange: (v: string) => void;
  onComplete?: () => void;
};

export function ChildFamilyCodeInput({ value, onChange, onComplete }: Props) {
  const [legacyMode, setLegacyMode] = useState(() => detectCodeEntryMode(value) === "legacy");

  const normalized = normalizeFamilyCode(value);

  const handleNumericChange = (digits: string) => {
    const next = digits.replace(/\D/g, "").slice(0, NEW_FAMILY_CODE_LEN);
    onChange(next);
    if (next.length === NEW_FAMILY_CODE_LEN) onComplete?.();
  };

  if (legacyMode) {
    return (
      <div className="space-y-3">
        <p className="text-center text-xs font-semibold text-outline/80">Kode lama (8 huruf & angka)</p>
        <AccessCodeInput value={value} onChange={onChange} />
        <button
          type="button"
          className="w-full text-center text-sm font-bold text-brand underline"
          onClick={() => {
            setLegacyMode(false);
            onChange("");
          }}
        >
          Pakai kode 6 angka
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-center text-sm font-semibold text-outline">Ketuk 6 angka kode keluarga</p>
      <NumericPinPad
        value={normalized}
        onChange={handleNumericChange}
        maxLength={NEW_FAMILY_CODE_LEN}
        slotLabel="Kode keluarga"
      />
      <button
        type="button"
        className="w-full text-center text-xs font-bold text-outline/70 underline"
        onClick={() => {
          setLegacyMode(true);
          onChange("");
        }}
      >
        Punya kode lama ({LEGACY_FAMILY_CODE_LEN} karakter)? Ketuk di sini
      </button>
    </div>
  );
}
