import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "../lib/api";
import { friendlyError, useGameToast } from "./game/GameToast";

type Parent = { id: string; name: string; email: string; family_role: string };

/** Daftar orang tua keluarga; pemilik dapat mengundang pasangan. */
export function FamilyParents({ myId }: { myId?: string }) {
  const toast = useGameToast();
  const { data } = useQuery({ queryKey: ["family-parents"], queryFn: () => api<Parent[]>("/family/parents") });
  const [link, setLink] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  if (!data) return null;
  const iAmOwner = data.some((p) => p.family_role === "owner" && (!myId || p.id === myId));

  const invite = async () => {
    setBusy(true);
    try {
      const r = await api<{ code: string }>("/family/invites", { method: "POST" });
      setLink(`${window.location.origin}/gabung?kode=${encodeURIComponent(r.code)}`);
    } catch (e) {
      toast(friendlyError(e), "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <h2 className="font-bold text-brand-dark">Orang tua dalam keluarga</h2>
      <ul className="text-sm">
        {data.map((p) => (
          <li key={p.id}>
            {p.name} <span className="text-xs text-gray-600">({p.family_role === "owner" ? "pemilik" : "orang tua"})</span>
          </li>
        ))}
      </ul>
      {iAmOwner && data.length < 2 && (
        <>
          <button type="button" className="btn-cta w-full" disabled={busy} onClick={() => void invite()}>
            Undang pasangan
          </button>
          {link && (
            <p className="break-all rounded-xl bg-gray-100 p-2 text-xs">
              Kirim tautan ini ke pasangan (berlaku 7 hari, sekali pakai): <strong>{link}</strong>
            </p>
          )}
        </>
      )}
    </>
  );
}
