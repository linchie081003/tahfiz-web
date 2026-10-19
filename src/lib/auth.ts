import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { clearToken } from "./api";

/** Hapus token JWT (sesi stateless — tidak perlu panggil API). */
export function logout() {
  clearToken();
}

export function useLogout() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  return useCallback(() => {
    clearToken();
    qc.clear();
    navigate("/login", { replace: true });
  }, [navigate, qc]);
}
