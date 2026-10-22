import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "./api";

export type Child = { id: string; name: string; color: string; age_mode: string; tahsin_status: string };

/** Daftar anak keluarga + anak terpilih (default: anak pertama). */
export function useChild() {
  const { data } = useQuery({ queryKey: ["members"], queryFn: () => api<Child[]>("/members") });
  const [sel, setSel] = useState<string | null>(null);
  const child = data?.find((c) => c.id === sel) ?? data?.[0] ?? null;
  return { children: data ?? [], child, select: setSel };
}
