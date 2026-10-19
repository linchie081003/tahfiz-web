/** Kode keluarga baru: 6 angka. Kode lama: 8 huruf/angka. */

export const NEW_FAMILY_CODE_LEN = 6;
export const LEGACY_FAMILY_CODE_LEN = 8;

export function normalizeFamilyCode(raw: string): string {
  return raw.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export function isNumericFamilyCode(code: string): boolean {
  return /^\d+$/.test(normalizeFamilyCode(code));
}

export function familyCodeReady(code: string): boolean {
  const c = normalizeFamilyCode(code);
  if (!c) return false;
  if (isNumericFamilyCode(c)) return c.length === NEW_FAMILY_CODE_LEN;
  return c.length >= 4;
}

export function formatFamilyCodeDisplay(code: string): string {
  const c = normalizeFamilyCode(code);
  if (isNumericFamilyCode(c) && c.length === NEW_FAMILY_CODE_LEN) {
    return `${c.slice(0, 3)} ${c.slice(3)}`;
  }
  if (c.length === LEGACY_FAMILY_CODE_LEN) {
    return `${c.slice(0, 4)} ${c.slice(4)}`;
  }
  return c;
}

export function detectCodeEntryMode(savedCode: string): "numeric" | "legacy" {
  const c = normalizeFamilyCode(savedCode);
  if (!c) return "numeric";
  if (/[A-Z]/.test(c) || c.length > NEW_FAMILY_CODE_LEN) return "legacy";
  return "numeric";
}
