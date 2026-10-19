import { createContext, useContext, useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import {
  readParentDashboardOpen,
  setParentDashboardOpen,
  subscribeParentDashboardOpen,
  toggleParentDashboardOpen,
} from "../lib/parentDashboardUi";

type DashCtx = {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
};

const ParentDashContext = createContext<DashCtx | null>(null);

export function ParentDashboardOpenProvider({ children }: { children: ReactNode }) {
  const [open, setOpenState] = useState(() => readParentDashboardOpen());

  useEffect(() => {
    return subscribeParentDashboardOpen(() => setOpenState(readParentDashboardOpen()));
  }, []);

  const setOpen = (next: boolean) => {
    setParentDashboardOpen(next);
    setOpenState(next);
  };

  const toggle = () => setOpen(!readParentDashboardOpen());

  return <ParentDashContext.Provider value={{ open, setOpen, toggle }}>{children}</ParentDashContext.Provider>;
}

export function useParentDashboardOpen(): DashCtx {
  const ctx = useContext(ParentDashContext);
  if (ctx) return ctx;
  const open = useSyncExternalStore(subscribeParentDashboardOpen, readParentDashboardOpen, () => true);
  return {
    open,
    setOpen: setParentDashboardOpen,
    toggle: toggleParentDashboardOpen,
  };
}
