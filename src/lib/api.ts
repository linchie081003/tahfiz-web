import { apiErrorMessage } from "./apiError";

export const API = import.meta.env.VITE_API_BASE ?? "http://localhost:8010";

export function getToken() {
  return localStorage.getItem("hafiz_token");
}

export function setToken(token: string) {
  localStorage.setItem("hafiz_token", token);
}

export function clearToken() {
  localStorage.removeItem("hafiz_token");
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (!headers.has("Content-Type") && !(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  let res: Response;
  try {
    res = await fetch(`${API}${path}`, { ...init, headers });
  } catch {
    throw new Error(
      `Tidak dapat hubungi API di ${API}. Pastikan backend jalan: uvicorn app.main:app --reload --port 8010`,
    );
  }
  if (res.status === 401 && token) {
    // Hanya token/sesi yang gagal yang memicu keluar otomatis (bukan PIN atau sandi salah).
    const body = await res.clone().text();
    if (/Token (tidak valid|diperlukan)|Sesi berakhir/.test(body)) {
      const { forceLogout } = await import("./auth");
      forceLogout();
      throw new Error("Sesi berakhir. Silakan masuk lagi.");
    }
  }
  if (!res.ok) {
    const err = await res.text();
    throw new Error(apiErrorMessage(res.status, err));
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export type HomeData = {
  greeting_name: string;
  age_mode?: "paud" | "sd" | "teen" | "adult" | null;
  streak_days: number;
  xp: number;
  level: number;
  rank_title: string;
  xp_next_level: number;
  mission_title: string;
  mission_detail: string;
  mission_xp: number;
  mission_action: string;
  tahsin_status: string;
  tahsin_wajib_lulus?: number | null;
  menu_locks: Record<string, string>;
  level_progress: number;
  parent_preview?: boolean;
  mission_items?: Record<string, string>;
  beauty_reward?: {
    submission_id: string;
    surah_id: number;
    ayah_start: number;
    ayah_end: number;
    audio_urls: string[];
    label: string;
  } | null;
};

export type PetaData = {
  juz_number: number;
  passed_count: number;
  total_count: number;
  track?: "juz30" | "mushaf";
  active_surah_id: number | null;
  active_surah_name: string | null;
  unlock_hint: string | null;
  nodes: { surah_id: number; name_id: string; ayah_count: number; status: string; curriculum_order: number; selectable?: boolean }[];
  hafalan_order?: "sequential" | "free";
  planned?: boolean;
  suggested_surah_id?: number | null;
  plan?: { surah_id: number; name_id: string; ayah_count: number; ayah_start: number; ayah_end: number; mode: "seluruh_surat" | "target_harian"; done_ayahs: number } | null;
};

export type RangeStatus = { ayah_start: number; ayah_end: number; status: string; evaluation_id: string | null };

export type Submission = {
  tahsin_point?: number | null;
  ayah_start?: number | null;
  ayah_end?: number | null;
  ranges?: RangeStatus[] | null;
  id: string;
  context: string;
  surah_id: number | null;
  reference_text: string;
  reference_text_tajweed?: string | null;
  status: string;
  ai_status: string;
  ai_insights: Record<string, unknown> | null;
  rubric_scores: Record<string, number> | null;
  recording_url: string | null;
  created_at: string;
  member_name: string | null;
};

/** Unduh berkas (dengan token login bila ada) lalu simpan lewat browser. */
export async function downloadFile(url: string, filename: string, auth = true) {
  const headers = new Headers();
  const token = getToken();
  if (auth && token) headers.set("Authorization", `Bearer ${token}`);
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error("Tautan unduhan tidak valid atau sudah kedaluwarsa");
  const blob = await res.blob();
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}
