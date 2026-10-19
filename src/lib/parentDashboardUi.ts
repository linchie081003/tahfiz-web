const KEY = "hafiz_parent_dash_open";
const EVENT = "hafiz_parent_dash_open_changed";

export function readParentDashboardOpen(): boolean {
  try {
    const v = localStorage.getItem(KEY);
    if (v === null) return true;
    return v === "1";
  } catch {
    return true;
  }
}

export function setParentDashboardOpen(open: boolean) {
  localStorage.setItem(KEY, open ? "1" : "0");
  window.dispatchEvent(new Event(EVENT));
}

export function toggleParentDashboardOpen(): boolean {
  const next = !readParentDashboardOpen();
  setParentDashboardOpen(next);
  return next;
}

export function subscribeParentDashboardOpen(cb: () => void) {
  const onChange = () => cb();
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}
