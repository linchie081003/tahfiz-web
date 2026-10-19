import { useQuery } from "@tanstack/react-query";
import { Navigate } from "react-router-dom";
import { api } from "../lib/api";

type Session = {
  role: string;
  needs_child_profile: boolean;
};

export function RequireMember({ children }: { children: React.ReactNode }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["session"],
    queryFn: () => api<Session>("/auth/session"),
    retry: false,
  });

  if (isLoading) {
    return <div className="app-shell p-8 text-center text-white">Memuat sesi…</div>;
  }

  if (isError) {
    return <Navigate to="/login" replace />;
  }

  if (data?.needs_child_profile) {
    return <Navigate to="/pilih-profil" replace />;
  }

  return <>{children}</>;
}
