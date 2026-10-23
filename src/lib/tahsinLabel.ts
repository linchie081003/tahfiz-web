/** Label konteks setoran untuk penilai: ujian Pulau bila ada nomor Pulau. */
export function contextLabel(context: string, tahsinPoint?: number | null): string {
  if (context === "tahsin") return tahsinPoint ? `Ujian Pulau ${tahsinPoint}` : "Tahsin";
  if (context === "ziyadah") return "Hafalan baru";
  if (context === "ujian") return "Ujian";
  return context;
}
