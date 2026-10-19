import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, setToken } from "../lib/api";
import { useLogout } from "../lib/auth";

type Member = {
  id: string;
  name: string;
  color: string;
  age_mode: string;
  tahsin_status: string;
};

type Session = {
  family_name: string;
  family_access_code: string;
};

export function ChooseProfilePage() {
  const nav = useNavigate();
  const qc = useQueryClient();
  const logout = useLogout();
  const [newName, setNewName] = useState("");
  const [busy, setBusy] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

  const session = useQuery({
    queryKey: ["session"],
    queryFn: () => api<Session & { role: string }>("/auth/session"),
  });

  const members = useQuery({
    queryKey: ["members"],
    queryFn: () => api<Member[]>("/members"),
  });

  const selectChild = async (memberId: string) => {
    setBusy(true);
    try {
      const t = await api<{ access_token: string }>(`/members/${memberId}/impersonate`, { method: "POST" });
      setToken(t.access_token);
      await qc.invalidateQueries({ queryKey: ["session"] });
      nav("/", { replace: true });
    } catch (e) {
      alert(String(e));
    } finally {
      setBusy(false);
    }
  };

  const deleteChild = async (m: Member) => {
    const ok = window.confirm(
      `Hapus profil "${m.name}"?\n\nProgres hafalan, setoran, dan XP anak ini akan dihapus permanen.`,
    );
    if (!ok) return;
    setBusy(true);
    try {
      const res = await api<{ access_token?: string | null }>(`/members/${m.id}`, { method: "DELETE" });
      if (res.access_token) setToken(res.access_token);
      await qc.invalidateQueries({ queryKey: ["members"] });
      await qc.invalidateQueries({ queryKey: ["session"] });
    } catch (e) {
      alert(String(e));
    } finally {
      setBusy(false);
    }
  };

  const createChild = async () => {
    if (!newName.trim()) return;
    setBusy(true);
    try {
      const m = await api<Member>("/members", {
        method: "POST",
        body: JSON.stringify({ name: newName.trim(), age_mode: "sd" }),
      });
      setNewName("");
      setShowAdd(false);
      await qc.invalidateQueries({ queryKey: ["members"] });
      await selectChild(m.id);
    } catch (e) {
      alert(String(e));
      setBusy(false);
    }
  };

  const list = members.data ?? [];

  return (
    <div className="app-shell min-h-dvh p-6">
      <h1 className="text-2xl font-extrabold">Pilih profil anak</h1>
      <p className="mt-1 text-sm text-white/90">
        Keluarga <strong>{session.data?.family_name ?? "…"}</strong>
      </p>
      {session.data?.family_access_code && (
        <p className="mt-2 rounded-2xl bg-white/15 p-3 text-sm">
          Kode login anak:{" "}
          <strong className="font-mono text-lg tracking-widest">{session.data.family_access_code}</strong>
          <span className="mt-1 block text-xs opacity-90">Bagikan kode ini ke anak — tidak perlu UUID.</span>
        </p>
      )}

      <div className="mt-4 space-y-3">
        {members.isLoading && <p className="text-white/90">Memuat profil…</p>}
        {list.map((m) => (
          <div key={m.id} className="card-surface flex items-center gap-3 p-3">
            <button
              type="button"
              disabled={busy}
              className="flex min-w-0 flex-1 items-center gap-4 text-left"
              onClick={() => void selectChild(m.id)}
            >
              <span
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-2xl font-bold text-white"
                style={{ backgroundColor: m.color }}
              >
                {m.name.charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0">
                <p className="text-lg font-bold text-gray-900">{m.name}</p>
                <p className="text-xs text-gray-500 capitalize">Mode {m.age_mode.replace("_", " ")}</p>
              </div>
            </button>
            <button
              type="button"
              disabled={busy}
              className="shrink-0 rounded-xl px-3 py-2 text-sm font-bold text-red-600 hover:bg-red-50"
              onClick={() => void deleteChild(m)}
            >
              Hapus
            </button>
          </div>
        ))}

        {!members.isLoading && list.length === 0 && (
          <p className="text-sm text-white/90">Belum ada profil anak. Buat profil pertama di bawah.</p>
        )}

        {!showAdd ? (
          <button
            type="button"
            className="w-full rounded-2xl border-2 border-dashed border-white/40 py-3 font-bold text-white"
            onClick={() => setShowAdd(true)}
          >
            + Tambah profil anak
          </button>
        ) : (
          <div className="card-surface space-y-3 p-4">
            <input
              className="w-full rounded-xl border p-2"
              placeholder="Nama anak"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <button type="button" className="btn-cta" disabled={busy} onClick={() => void createChild()}>
              Simpan &amp; lanjut
            </button>
            <button type="button" className="text-sm text-gray-600 underline" onClick={() => setShowAdd(false)}>
              Batal
            </button>
          </div>
        )}
      </div>

      <button type="button" className="mt-8 w-full text-sm text-white/80 underline" onClick={logout}>
        Ganti akun orang tua
      </button>
    </div>
  );
}
