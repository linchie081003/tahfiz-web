const API = import.meta.env.VITE_API_BASE ?? "http://localhost:8010";

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
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || res.statusText);
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
  menu_locks: Record<string, string>;
  level_progress: number;
  parent_preview?: boolean;
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
  active_surah_id: number | null;
  active_surah_name: string | null;
  unlock_hint: string | null;
  nodes: { surah_id: number; name_id: string; ayah_count: number; status: string; curriculum_order: number }[];
};

export type Submission = {
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
