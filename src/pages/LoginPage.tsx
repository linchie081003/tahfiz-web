import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, setToken } from "../lib/api";

const FAMILY_CODE_KEY = "hafiz_family_code";

type PublicChild = { id: string; name: string; color: string; has_pin: boolean };
type PublicFamily = { family_name: string; children: PublicChild[] };

export function LoginPage() {
  const nav = useNavigate();
  const [mode, setMode] = useState<"parent" | "register" | "child">("parent");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [familyName, setFamilyName] = useState("");
  const [adminName, setAdminName] = useState("");
  const [accessCode, setAccessCode] = useState(() => localStorage.getItem(FAMILY_CODE_KEY) ?? "");
  const [familyPreview, setFamilyPreview] = useState<PublicFamily | null>(null);
  const [selectedChild, setSelectedChild] = useState<PublicChild | null>(null);
  const [pin, setPin] = useState("");
  const [childStep, setChildStep] = useState<"code" | "pick" | "pin">("code");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (mode !== "child") {
      setChildStep("code");
      setFamilyPreview(null);
      setSelectedChild(null);
      setPin("");
    }
  }, [mode]);

  const parentLogin = async () => {
    const t = await api<{ access_token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    setToken(t.access_token);
    nav("/pilih-profil", { replace: true });
  };

  const registerFamily = async () => {
    const t = await api<{ access_token: string; family_access_code: string }>("/auth/register-family", {
      method: "POST",
      body: JSON.stringify({
        family_name: familyName,
        admin_name: adminName,
        admin_email: email,
        admin_password: password,
      }),
    });
    setToken(t.access_token);
    localStorage.setItem(FAMILY_CODE_KEY, t.family_access_code);
    nav("/pilih-profil", { replace: true });
  };

  const loadFamilyChildren = async () => {
    const code = accessCode.trim().toUpperCase();
    if (!code) return;
    const data = await api<PublicFamily>(`/auth/family-children?access_code=${encodeURIComponent(code)}`);
    setFamilyPreview(data);
    localStorage.setItem(FAMILY_CODE_KEY, code);
    setChildStep("pick");
  };

  const startChildPin = (child: PublicChild) => {
    setSelectedChild(child);
    if (child.has_pin) {
      setPin("");
      setChildStep("pin");
    } else {
      void childLogin(child, "");
    }
  };

  const childLogin = async (child: PublicChild, childPin: string) => {
    const t = await api<{ access_token: string }>("/auth/child-login", {
      method: "POST",
      body: JSON.stringify({
        access_code: accessCode.trim().toUpperCase(),
        child_id: child.id,
        pin: childPin,
      }),
    });
    setToken(t.access_token);
    nav("/", { replace: true });
  };

  const submit = async () => {
    setBusy(true);
    try {
      if (mode === "register") await registerFamily();
      else if (mode === "parent") await parentLogin();
    } catch (e) {
      alert(String(e));
    } finally {
      setBusy(false);
    }
  };

  const submitChildPin = async () => {
    if (!selectedChild) return;
    setBusy(true);
    try {
      await childLogin(selectedChild, pin);
    } catch (e) {
      alert(String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="app-shell flex min-h-dvh flex-col justify-center p-6">
      <h1 className="mb-2 text-center text-3xl font-extrabold">Hafiz</h1>
      <p className="mb-6 text-center text-sm text-white/90">Misi hafalan Qur&apos;an keluarga</p>
      <div className="card-surface space-y-3 p-4">
        <div className="flex gap-2 text-xs sm:text-sm">
          {(
            [
              ["parent", "Orang tua"],
              ["child", "Anak"],
              ["register", "Daftar baru"],
            ] as const
          ).map(([m, label]) => (
            <button
              key={m}
              type="button"
              className={`flex-1 rounded-lg py-2 font-semibold ${mode === m ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-800"}`}
              onClick={() => setMode(m)}
            >
              {label}
            </button>
          ))}
        </div>

        {mode === "register" && (
          <>
            <input
              className="w-full rounded-xl border p-2"
              placeholder="Nama keluarga"
              value={familyName}
              onChange={(e) => setFamilyName(e.target.value)}
            />
            <input
              className="w-full rounded-xl border p-2"
              placeholder="Nama Anda (orang tua)"
              value={adminName}
              onChange={(e) => setAdminName(e.target.value)}
            />
          </>
        )}

        {(mode === "parent" || mode === "register") && (
          <>
            <input
              className="w-full rounded-xl border p-2"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              className="w-full rounded-xl border p-2"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="button" className="btn-cta" disabled={busy} onClick={() => void submit()}>
              {mode === "register" ? "Buat akun keluarga" : "Masuk sebagai orang tua"}
            </button>
            {mode === "parent" && (
              <p className="text-xs text-gray-600">Setelah masuk, pilih profil anak yang sudah terdaftar.</p>
            )}
          </>
        )}

        {mode === "child" && childStep === "code" && (
          <>
            <p className="text-sm text-gray-700">Masukkan kode keluarga dari orang tua (8 huruf/angka).</p>
            <input
              className="w-full rounded-xl border p-2 font-mono uppercase tracking-widest"
              placeholder="Kode keluarga"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
            />
            <button
              type="button"
              className="btn-cta"
              disabled={busy || !accessCode.trim()}
              onClick={() => {
                setBusy(true);
                void loadFamilyChildren()
                  .catch((e) => alert(String(e)))
                  .finally(() => setBusy(false));
              }}
            >
              Lihat profil anak
            </button>
          </>
        )}

        {mode === "child" && childStep === "pick" && familyPreview && (
          <>
            <p className="text-sm font-semibold text-gray-800">Keluarga {familyPreview.family_name}</p>
            <p className="text-xs text-gray-600">Pilih nama Anda:</p>
            <div className="space-y-2">
              {familyPreview.children.length === 0 && (
                <p className="text-sm text-gray-600">Belum ada profil. Minta orang tua buat profil dulu.</p>
              )}
              {familyPreview.children.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className="flex w-full items-center gap-3 rounded-xl border p-3 text-left"
                  onClick={() => startChildPin(c)}
                >
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-full font-bold text-white"
                    style={{ backgroundColor: c.color }}
                  >
                    {c.name.charAt(0)}
                  </span>
                  <span className="font-bold text-gray-900">{c.name}</span>
                  {c.has_pin && <span className="ml-auto text-xs text-gray-500">PIN</span>}
                </button>
              ))}
            </div>
            <button type="button" className="text-sm text-purple-700 underline" onClick={() => setChildStep("code")}>
              Ganti kode keluarga
            </button>
          </>
        )}

        {mode === "child" && childStep === "pin" && selectedChild && (
          <>
            <p className="text-sm text-gray-700">
              PIN untuk <strong>{selectedChild.name}</strong>
            </p>
            <input
              className="w-full rounded-xl border p-2"
              type="password"
              inputMode="numeric"
              placeholder="PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
            />
            <button type="button" className="btn-cta" disabled={busy} onClick={() => void submitChildPin()}>
              Masuk
            </button>
            <button type="button" className="text-sm text-purple-700 underline" onClick={() => setChildStep("pick")}>
              ← Pilih profil lain
            </button>
          </>
        )}
      </div>
    </div>
  );
}
