import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { api, clearToken, getToken, setToken } from "./api";

/** Peran dari payload JWT (tanpa verifikasi; hanya untuk mengarahkan layar). */
export function tokenRole(): string | null {
  try {
    const part = (getToken() ?? "").split(".")[1];
    return JSON.parse(atob(part.replace(/-/g, "+").replace(/_/g, "/"))).role ?? null;
  } catch {
    return null;
  }
}

/** True bila orang tua sedang masuk lewat "Mode anak" (token orang tua yang membawa profil anak). */
export function inChildModeAsParent(): boolean {
  try {
    const part = (getToken() ?? "").split(".")[1];
    const p = JSON.parse(atob(part.replace(/-/g, "+").replace(/_/g, "/")));
    return p.role === "parent" && !!p.member_id;
  } catch {
    return false;
  }
}

/** Keluar dari Mode anak kembali ke area orang tua. Tanpa PIN, karena orang tua sudah masuk dengan akunnya. */
export async function exitChildMode(): Promise<void> {
  const t = await api<{ access_token: string }>("/members/exit-impersonate", { method: "POST" });
  setToken(t.access_token);
  window.location.replace("/parent");
}

export function loginPathFor(role: string | null): string {
  return role === "teacher" ? "/guru/masuk" : "/login";
}

/** Keluar tanpa hook (mis. dari api() saat sesi habis): hapus token lalu muat ulang agar semua cache hilang. */
export function forceLogout(): void {
  const to = loginPathFor(tokenRole());
  clearToken();
  window.location.replace(to);
}

/** Keluar untuk semua peran. Sesi JWT stateless: token dibuang di perangkat ini dan cache dibersihkan.
 *  Kode keluarga di perangkat dipertahankan agar anak bisa masuk lagi dengan cepat. */
export function useLogout(confirmFirst = true) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  return useCallback(() => {
    if (confirmFirst && !window.confirm("Keluar dari Hafiz di perangkat ini?")) return;
    const to = loginPathFor(tokenRole());
    clearToken();
    qc.clear();
    navigate(to, { replace: true });
  }, [navigate, qc, confirmFirst]);
}
