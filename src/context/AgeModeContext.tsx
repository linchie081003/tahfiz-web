import { createContext, useContext, useMemo, useSyncExternalStore, type ReactNode } from "react";

export type AgeMode = "paud" | "sd" | "teen" | "adult";

const KEY = "hafiz_age_mode";
const EVENT = "hafiz_age_mode_changed";

const defaultMode: AgeMode = "sd";

function readMode(): AgeMode {
  const raw = localStorage.getItem(KEY);
  if (raw === "paud" || raw === "sd" || raw === "teen" || raw === "adult") return raw;
  return defaultMode;
}

function subscribe(cb: () => void) {
  const onChange = () => cb();
  window.addEventListener(EVENT, onChange);
  return () => window.removeEventListener(EVENT, onChange);
}

export function setAgeMode(mode: AgeMode) {
  localStorage.setItem(KEY, mode);
  window.dispatchEvent(new Event(EVENT));
}

const AgeModeContext = createContext<{ mode: AgeMode; ageClass: string; isCalm: boolean }>({
  mode: defaultMode,
  ageClass: "age-sd",
  isCalm: false,
});

export function AgeModeProvider({ children }: { children: ReactNode }) {
  const mode = useSyncExternalStore(subscribe, readMode, () => defaultMode);
  const value = useMemo(() => {
    const ageClass = `age-${mode}`;
    const isCalm = mode === "adult";
    return { mode, ageClass, isCalm };
  }, [mode]);
  return <AgeModeContext.Provider value={value}>{children}</AgeModeContext.Provider>;
}

export function useAgeMode() {
  return useContext(AgeModeContext);
}
