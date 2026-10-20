import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, setToken } from "../lib/api";
import { GameButton } from "../components/game/GameButton";
import { GameCard } from "../components/game/GameCard";
import { useGameConfirm } from "../components/game/GameDialog";
import { friendlyError, useGameToast } from "../components/game/GameToast";
import { setAgeMode, type AgeMode } from "../context/AgeModeContext";
import { formatFamilyCodeDisplay } from "../lib/familyCode";
import { syncReciterToAgeMode } from "../lib/reciterPolicy";
import { AgeModeSelect } from "../components/AgeModeSelect";
import { ageModeLabel } from "../lib/ageModeOptions";
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
  const toast = useGameToast();
  const confirmDialog = useGameConfirm();
  const logout = useLogout();
  const [newName, setNewName] = useState("");
  const [busy, setBusy] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [newAgeMode, setNewAgeMode] = useState<AgeMode>("sd");

  const session = useQuery({
    queryKey: ["session"],
    queryFn: () => api<Session & { role: string }>("/auth/session"),
  });

  useEffect(() => {
    if (session.data?.family_access_code) {
      localStorage.setItem("hafiz_family_code", session.data.family_access_code);
      localStorage.setItem("hafiz_family_name", session.data.family_name);
    }
  }, [session.data?.family_access_code, session.data?.family_name]);

  const members = useQuery({
    queryKey: ["members"],
    queryFn: () => api<Member[]>("/members"),
  });

  const selectChild = async (memberId: string, ageMode?: string) => {
    setBusy(true);
    try {
      if (ageMode === "paud" || ageMode === "sd" || ageMode === "teen" || ageMode === "adult") {
        setAgeMode(ageMode as AgeMode);
        syncReciterToAgeMode(ageMode as AgeMode);
      }
      const t = await api<{ access_token: string }>(`/members/${memberId}/impersonate`, { method: "POST" });
      setToken(t.access_token);
      await qc.invalidateQueries({ queryKey: ["session"] });
      nav("/", { replace: true });
    } catch (e) {
      toast(friendlyError(e), "error");
    } finally {
      setBusy(false);
    }
  };

  const deleteChild = async (m: Member) => {
    const ok = await confirmDialog({
      title: `Hapus profil ${m.name}?`,
      message: "Progres hafalan, setoran, dan XP anak ini akan dihapus permanen. Ini tidak bisa dibatalkan.",
      confirmLabel: "Hapus",
      tone: "danger",
    });
    if (!ok) return;
    setBusy(true);
    try {
      const res = await api<{ access_token?: string | null }>(`/members/${m.id}`, { method: "DELETE" });
      if (res.access_token) setToken(res.access_token);
      await qc.invalidateQueries({ queryKey: ["members"] });
      await qc.invalidateQueries({ queryKey: ["session"] });
    } catch (e) {
      toast(friendlyError(e), "error");
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
        body: JSON.stringify({ name: newName.trim(), age_mode: newAgeMode }),
      });
      setNewName("");
      setShowAdd(false);
      await qc.invalidateQueries({ queryKey: ["members"] });
      await selectChild(m.id);
    } catch (e) {
      toast(friendlyError(e), "error");
      setBusy(false);
    }
  };

  const updateChildAge = async (memberId: string, age_mode: AgeMode) => {
    setBusy(true);
    try {
      await api(`/members/${memberId}`, { method: "PATCH", body: JSON.stringify({ age_mode }) });
      await qc.invalidateQueries({ queryKey: ["members"] });
    } catch (e) {
      toast(friendlyError(e), "error");
    } finally {
      setBusy(false);
    }
  };

  const list = members.data ?? [];

  return (
    <div className="app-shell min-h-dvh px-6 pb-24 pt-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-extrabold">Pilih profil anak</h1>
        <Link to="/parent" className="rounded-pill border-2 border-white/40 bg-white/15 px-3 py-1 text-sm font-bold text-white">
          Dashboard keluarga
        </Link>
      </div>
      <p className="mt-1 text-sm text-white/90">
        Keluarga <strong>{session.data?.family_name ?? "…"}</strong>
      </p>
      {session.data?.family_access_code && (
        <p className="mt-2 rounded-2xl bg-white/15 p-4 text-sm">
          <span className="font-bold">Kode login anak</span> (6 angka — tempel di meja belajar):
          <strong className="mt-2 block break-all font-mono text-2xl tracking-wide sm:text-3xl">
            {formatFamilyCodeDisplay(session.data.family_access_code)}
          </strong>
          <span className="mt-2 block text-xs opacity-90">
            Anak cukup buka tab Anak, ketuk angka ini, pilih nama, lalu PIN jika ada. Perangkat yang pernah login akan
            mengingat kode.
          </span>
        </p>
      )}

      <div className="mt-4 space-y-3">
        {members.isLoading && <p className="text-white/90">Memuat profil…</p>}
        {list.map((m) => (
          <div key={m.id} className="card-surface space-y-3 p-4">
            <div className="flex items-start gap-3">
              <span
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-xl font-bold text-white"
                style={{ backgroundColor: m.color }}
              >
                {m.name.charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-lg font-bold text-gray-900">{m.name}</p>
                <p className="text-xs text-gray-500">{ageModeLabel(m.age_mode)}</p>
              </div>
              <button
                type="button"
                disabled={busy}
                className="shrink-0 rounded-lg px-2 py-1 text-xs font-bold text-red-600 hover:bg-red-50"
                onClick={() => void deleteChild(m)}
              >
                Hapus
              </button>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-600" htmlFor={`age-${m.id}`}>
                Mode usia
              </label>
              <AgeModeSelect
                id={`age-${m.id}`}
                className="w-full rounded-xl border p-2 text-sm"
                value={(m.age_mode as AgeMode) || "sd"}
                disabled={busy}
                onChange={(mode) => void updateChildAge(m.id, mode)}
              />
            </div>

            <GameButton disabled={busy} onClick={() => void selectChild(m.id, m.age_mode)}>
              Buka Home — {m.name}
            </GameButton>
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
            <label className="block text-sm font-semibold text-gray-800">Mode usia</label>
            <AgeModeSelect value={newAgeMode} disabled={busy} onChange={setNewAgeMode} />
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
