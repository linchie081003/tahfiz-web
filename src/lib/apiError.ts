/** Mengubah respons error API (JSON FastAPI, HTML, atau teks) menjadi satu kalimat Indonesia yang ramah. */

const BY_STATUS: Record<number, string> = {
  400: "Permintaan tidak dapat diproses. Periksa isiannya.",
  401: "Sesi berakhir. Silakan masuk lagi.",
  403: "Anda tidak punya izin untuk tindakan ini.",
  404: "Data tidak ditemukan.",
  409: "Tindakan ini bentrok dengan data yang ada. Muat ulang lalu coba lagi.",
  413: "Berkas terlalu besar.",
  422: "Isian belum benar. Periksa lalu coba lagi.",
  429: "Terlalu banyak percobaan. Tunggu sebentar lalu coba lagi.",
  500: "Terjadi kesalahan di server. Coba lagi sebentar lagi.",
  502: "Server sedang tidak tersedia. Coba lagi sebentar lagi.",
  503: "Server sedang tidak tersedia. Coba lagi sebentar lagi.",
  504: "Server terlalu lama menjawab. Coba lagi.",
};

const FIELD: Record<string, string> = {
  reason: "Alasan", status: "Status", email: "Email", password: "Kata sandi", name: "Nama", pin: "PIN",
  admin_email: "Email", admin_password: "Kata sandi", admin_name: "Nama", family_name: "Nama keluarga",
  rubric_scores: "Penilaian", evaluator_notes: "Catatan", score: "Nilai",
};

type Item = { loc?: unknown[]; msg?: string; type?: string; ctx?: { min_length?: number; max_length?: number } };

function fromItem(it: Item): string {
  const field = [...(it.loc ?? [])].reverse().find((p) => typeof p === "string" && p !== "body") as string | undefined;
  const label = field ? FIELD[field] ?? "Isian" : "Isian";
  const msg = it.msg ?? "";
  if (/^Value error, /i.test(msg)) return msg.replace(/^Value error, /i, "").replace(/^./, (c) => c.toUpperCase());
  switch (it.type) {
    case "missing": return `${label} wajib diisi.`;
    case "string_too_short": return it.ctx?.min_length === 1 ? `${label} wajib diisi.` : `${label} terlalu pendek.`;
    case "string_too_long": return `${label} terlalu panjang.`;
    default: return `${label} tidak valid.`;
  }
}

export function apiErrorMessage(status: number, body: string): string {
  const text = (body ?? "").trim();
  if (text.startsWith("{") || text.startsWith("[")) {
    try {
      const j = JSON.parse(text) as { detail?: unknown; message?: unknown };
      const d = j.detail ?? j.message;
      if (typeof d === "string" && d.trim()) return d;
      if (Array.isArray(d) && d.length) return [...new Set(d.map((x) => (typeof x === "string" ? x : fromItem(x as Item))))].join(" ");
    } catch { /* bukan JSON valid: jatuh ke pesan standar */ }
    return BY_STATUS[status] ?? "Terjadi kesalahan, coba lagi.";
  }
  // HTML atau teks panjang dari proxy/server bukan untuk ditampilkan
  if (!text || text.startsWith("<") || text.length > 200) return BY_STATUS[status] ?? "Terjadi kesalahan, coba lagi.";
  return text;
}
