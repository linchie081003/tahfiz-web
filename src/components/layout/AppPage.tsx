import type { ReactNode } from "react";

/** Padding halaman + ruang untuk menu footer. */
export function AppPage({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`app-page space-y-4 p-4 pb-24 pt-1 ${className}`}>{children}</div>;
}

export function PageTitleRow({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`flex min-h-10 items-center ${className}`}>{children}</div>;
}
