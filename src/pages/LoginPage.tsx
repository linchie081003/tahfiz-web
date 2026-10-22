import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { LoginChooser } from "./LoginChooser";
import { ChildFamilyCodeInput } from "../components/game/ChildFamilyCodeInput";
import { GameButton } from "../components/game/GameButton";
import { GameInput } from "../components/game/GameInput";
import { GameScene } from "../components/game/GameScene";
import { GameTabs } from "../components/game/GameTabs";
import { Mascot } from "../components/game/Mascot";
import { NumericPinPad } from "../components/game/NumericPinPad";
import { useGameToast } from "../components/game/GameToast";
import { api, setToken } from "../lib/api";
import { familyCodeReady, formatFamilyCodeDisplay, normalizeFamilyCode } from "../lib/familyCode";

const FAMILY_CODE_KEY = "hafiz_family_code";
const FAMILY_NAME_KEY = "hafiz_family_name";
const LAST_CHILD_KEY = "hafiz_last_child_id";

type Tab = "parent" | "child" | "register";
type ParentStep = "login" | "forgot";
type PublicChild = { id: string; name: string; color: string; has_pin: boolean };
type PublicFamily = { family_name: string; children: PublicChild[] };

export function LoginPage() {
  const nav = useNavigate();
  const toast = useGameToast();
  const [sp] = useSearchParams();
  const initial = sp.get("tab");
  const [chosen, setChosen] = useState<boolean>(initial === "parent" || initial === "child" || initial === "register");
  const [tab, setTab] = useState<Tab>(initial === "child" ? "child" : initial === "register" ? "register" : "parent");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [familyName, setFamilyName] = useState("");
  const [adminName, setAdminName] = useState("");
  const [accessCode, setAccessCode] = useState(() => localStorage.getItem(FAMILY_CODE_KEY) ?? "");
  const [familyPreview, setFamilyPreview] = useState<PublicFamily | null>(null);
  const [selectedChild, setSelectedChild] = useState<PublicChild | null>(null);
  const [pin, setPin] = useState("");
  const [childStep, setChildStep] = useState<"code" | "pick" | "pin">("code");
  const [parentStep, setParentStep] = useState<ParentStep>("login");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [restoringFamily, setRestoringFamily] = useState(false);
  const autoRestoreDone = useRef(false);

  useEffect(() => {
    if (tab !== "child") {
      setChildStep("code");
      setFamilyPreview(null);
      setSelectedChild(null);
      setPin("");
      autoRestoreDone.current = false;
    }
    if (tab !== "parent") setParentStep("login");
  }, [tab]);

  const loadFamilyChildren = useCallback(async (codeOverride?: string) => {
    const code = normalizeFamilyCode(codeOverride ?? accessCode);
    if (!familyCodeReady(code)) throw new Error("Kode keluarga belum lengkap");
    const data = await api<PublicFamily>(`/auth/family-children?access_code=${encodeURIComponent(code)}`);
    setAccessCode(code);
    setFamilyPreview(data);
    localStorage.setItem(FAMILY_CODE_KEY, code);
    localStorage.setItem(FAMILY_NAME_KEY, data.family_name);
    setChildStep("pick");
    return data;
  }, [accessCode]);

  useEffect(() => {
    if (tab !== "child" || autoRestoreDone.current) return;
    const saved = localStorage.getItem(FAMILY_CODE_KEY);
    if (!saved || !familyCodeReady(saved)) return;
    autoRestoreDone.current = true;
    setRestoringFamily(true);
    void loadFamilyChildren(saved)
      .catch(() => {
        setChildStep("code");
      })
      .finally(() => setRestoringFamily(false));
  }, [tab, loadFamilyChildren]);

  const parentLogin = async () => {
    const t = await api<{ access_token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    setToken(t.access_token);
    nav("/", { replace: true });
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
    nav("/parent/persetujuan", { replace: true });
  };

  const childLogin = async (child: PublicChild, childPin: string) => {
    const t = await api<{ access_token: string }>("/auth/child-login", {
      method: "POST",
      body: JSON.stringify({
        access_code: normalizeFamilyCode(accessCode),
        child_id: child.id,
        pin: childPin,
      }),
    });
    setToken(t.access_token);
    localStorage.setItem(LAST_CHILD_KEY, child.id);
    nav("/", { replace: true });
  };

  const submitParent = async () => {
    setBusy(true);
    try {
      if (tab === "register") await registerFamily();
      else await parentLogin();
    } catch (e) {
      toast(String(e));
    } finally {
      setBusy(false);
    }
  };

  const submitForgotPassword = async () => {
    setBusy(true);
    try {
      await api("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({
          email,
          access_code: normalizeFamilyCode(resetCode),
          new_password: newPassword,
        }),
      });
      toast("Kata sandi berhasil diubah. Silakan masuk.");
      setPassword(newPassword);
      setNewPassword("");
      setResetCode("");
      setParentStep("login");
    } catch (e) {
      toast(String(e));
    } finally {
      setBusy(false);
    }
  };

  const tryLoadCode = () => {
    setBusy(true);
    void loadFamilyChildren()
      .catch((e) => toast(String(e)))
      .finally(() => setBusy(false));
  };

  const savedFamilyName = localStorage.getItem(FAMILY_NAME_KEY);
  const lastChildId = localStorage.getItem(LAST_CHILD_KEY);

  if (!chosen) {
    return <LoginChooser onChild={() => { setTab("child"); setChosen(true); }} onParent={() => { setTab("parent"); setChosen(true); }} onRegister={() => { setTab("register"); setChosen(true); }} />;
  }

  return (
    <div className="app-shell">
      <GameScene className="flex min-h-dvh flex-col px-4 pb-8 pt-6">
        <div className="flex items-center gap-3">
          <Mascot mood="happy" size={64} className="shrink-0" />
          <div>
            <h1 className="text-[28px] font-extrabold leading-tight text-outline">Hafiz</h1>
            <p className="text-sm font-medium text-muted">Belajar Al-Qur'an bersama keluarga</p>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          <GameTabs
            tabs={[
              { id: "parent" as const, label: "Orang Tua" },
              { id: "child" as const, label: "Anak" },
              { id: "register" as const, label: "Daftar" },
            ]}
            value={tab}
            onChange={setTab}
          />

          {(tab === "parent" || tab === "register") && (
            <>
              {tab === "register" && (
                <>
                  <GameInput placeholder="Nama keluarga" value={familyName} onChange={(e) => setFamilyName(e.target.value)} leftIcon="none" />
                  <GameInput placeholder="Nama Anda" value={adminName} onChange={(e) => setAdminName(e.target.value)} leftIcon="none" />
                </>
              )}
              {tab === "parent" && parentStep === "forgot" ? (
                <>
                  <p className="text-sm font-semibold text-outline">
                    Reset kata sandi dengan <strong>email orang tua</strong> dan <strong>6 angka kode keluarga</strong> (sama
                    seperti yang dipakai anak login).
                  </p>
                  <GameInput placeholder="Email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                  <GameInput
                    placeholder="Kode keluarga (6 angka)"
                    inputMode="numeric"
                    autoComplete="off"
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    leftIcon="none"
                  />
                  <GameInput
                    placeholder="Kata sandi baru (min. 8 karakter)"
                    type="password"
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <GameButton
                    disabled={busy || !email || resetCode.length < 6 || newPassword.length < 8}
                    onClick={() => void submitForgotPassword()}
                  >
                    Simpan kata sandi baru
                  </GameButton>
                  <button
                    type="button"
                    className="flex min-h-[44px] items-center text-sm font-extrabold text-brand"
                    onClick={() => setParentStep("login")}
                  >
                    ← Kembali ke masuk
                  </button>
                </>
              ) : (
                <>
                  <GameInput placeholder="Email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                  <GameInput placeholder="Kata sandi" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
                  {tab === "parent" && (
                    <button
                      type="button"
                      className="flex min-h-[44px] items-center self-end text-sm font-extrabold text-brand"
                      onClick={() => setParentStep("forgot")}
                    >
                      Lupa kata sandi?
                    </button>
                  )}
                  <GameButton disabled={busy} onClick={() => void submitParent()}>
                    {tab === "register" ? "Daftar" : "Masuk"}
                  </GameButton>
                </>
              )}
            </>
          )}

          {tab === "child" && childStep === "code" && (
            <>
              {restoringFamily ? (
                <p className="text-center text-sm font-semibold text-outline">Membuka keluarga tersimpan…</p>
              ) : (
                <>
                  {savedFamilyName && accessCode && (
                    <p className="rounded-card bg-lav p-3 text-center text-sm font-semibold text-outline">
                      Perangkat ini mengenali keluarga <strong>{savedFamilyName}</strong>
                      <br />
                      <span className="font-mono text-lg tracking-widest">{formatFamilyCodeDisplay(accessCode)}</span>
                    </p>
                  )}
                  <p className="text-sm font-semibold text-outline">
                    Minta orang tua tunjukkan <strong>6 angka</strong> kode keluarga (tempel di kulkas / meja belajar).
                  </p>
                  <ChildFamilyCodeInput
                    value={accessCode}
                    onChange={setAccessCode}
                    onComplete={() => {
                      if (!busy) tryLoadCode();
                    }}
                  />
                  <GameButton disabled={busy || !familyCodeReady(accessCode)} onClick={tryLoadCode}>
                    Lanjut
                  </GameButton>
                </>
              )}
            </>
          )}

          {tab === "child" && childStep === "pick" && familyPreview && (
            <>
              <p className="font-bold text-outline">Keluarga {familyPreview.family_name}</p>
              <p className="text-sm text-outline/80">Pilih namamu:</p>
              <div className="space-y-2">
                {[...familyPreview.children]
                  .sort((a, b) => {
                    if (a.id === lastChildId) return -1;
                    if (b.id === lastChildId) return 1;
                    return 0;
                  })
                  .map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      className={`flex min-h-[56px] w-full items-center gap-3 rounded-pill bg-brand-light p-2 pr-4 ${
                        c.id === lastChildId ? "ring-2 ring-brand" : ""
                      }`}
                      onClick={() => {
                        setSelectedChild(c);
                        if (c.has_pin) {
                          setPin("");
                          setChildStep("pin");
                        } else void childLogin(c, "").catch((e) => toast(String(e)));
                      }}
                    >
                      <span
                        className="flex h-10 w-10 items-center justify-center rounded-full font-bold text-white"
                        style={{ backgroundColor: c.color }}
                      >
                        {c.name.charAt(0)}
                      </span>
                      <span className="font-extrabold text-outline">
                        {c.name}
                        {c.id === lastChildId ? " · terakhir" : ""}
                      </span>
                    </button>
                  ))}
              </div>
              <button
                type="button"
                className="flex min-h-[44px] items-center text-sm font-extrabold text-brand"
                onClick={() => {
                  setFamilyPreview(null);
                  setChildStep("code");
                }}
              >
                Bukan keluarga ini?
              </button>
            </>
          )}

          {tab === "child" && childStep === "pin" && selectedChild && (
            <>
              <p className="text-center text-sm font-bold text-outline">PIN untuk {selectedChild.name}</p>
              <NumericPinPad value={pin} onChange={setPin} maxLength={6} mask slotLabel="PIN" />
              <GameButton
                disabled={busy || pin.length < 4}
                onClick={() => {
                  setBusy(true);
                  void childLogin(selectedChild, pin)
                    .catch((e) => toast(String(e)))
                    .finally(() => setBusy(false));
                }}
              >
                Masuk
              </GameButton>
              <button type="button" className="flex min-h-[44px] items-center text-sm font-extrabold text-brand" onClick={() => setChildStep("pick")}>
                Pilih profil lain
              </button>
            </>
          )}
        </div>
      </GameScene>
    </div>
  );
}
