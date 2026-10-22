import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { setAgeMode, useAgeMode, type AgeMode } from "../context/AgeModeContext";
import { HomeChildScene } from "../components/home/HomeChildScene";
import { HomeParentHeader } from "../components/home/HomeParentHeader";
import { BeautyRewardCard } from "../components/BeautyRewardCard";
import { api, type HomeData } from "../lib/api";
import { useParentDashboardOpen } from "../context/ParentDashboardOpenContext";

export function HomePage() {
  const session = useQuery({
    queryKey: ["session"],
    queryFn: () =>
      api<{ role: string; age_mode?: string | null; member_name?: string | null; member_id?: string | null }>(
        "/auth/session",
      ),
  });
  const placement = useQuery({
    queryKey: ["placement", session.data?.member_id],
    queryFn: () => api<{ placement: string | null }>("/placement"),
    enabled: !!session.data?.member_id,
    retry: false,
  });
  const { mode: ageMode } = useAgeMode();
  const isParent = session.data?.role === "parent";
  const { open: dashOpen, setOpen: setDashOpen } = useParentDashboardOpen();
  const parentDash = useQuery({
    queryKey: ["parent-dashboard"],
    queryFn: () => api<{ queue_total: number }>("/parent/dashboard"),
    enabled: isParent,
    retry: false,
    staleTime: 30_000,
  });
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["home"],
    queryFn: () => api<HomeData>("/home"),
  });

  useEffect(() => {
    const m = session.data?.age_mode ?? data?.age_mode;
    if (m === "paud" || m === "sd" || m === "teen" || m === "adult") {
      setAgeMode(m as AgeMode);
    }
  }, [session.data?.age_mode, data?.age_mode]);

  const effectiveAge: AgeMode =
    session.data?.age_mode === "paud" ||
    session.data?.age_mode === "sd" ||
    session.data?.age_mode === "teen" ||
    session.data?.age_mode === "adult"
      ? session.data.age_mode
      : data?.age_mode === "paud" ||
          data?.age_mode === "sd" ||
          data?.age_mode === "teen" ||
          data?.age_mode === "adult"
        ? data.age_mode
        : ageMode;

  if (session.data?.member_id && placement.data && placement.data.placement === null) return <Navigate to="/onboarding" replace />;

  if (isError) {
    return (
      <div className="space-y-2 p-8 text-center">
        <p className="font-bold text-outline">Tidak bisa memuat Home</p>
        <p className="text-sm font-semibold text-outline">{error instanceof Error ? error.message : String(error)}</p>
      </div>
    );
  }
  if (isLoading || !data) return <div className="p-8 text-center font-bold text-outline">Memuat…</div>;

  const queueTotal = parentDash.data?.queue_total ?? 0;

  return (
    <div className="px-4 pb-6 pt-1">
      {!isParent ? (
        <HomeChildScene home={data} ageMode={effectiveAge} />
      ) : (
        <HomeParentHeader
          name={data.greeting_name}
          memberId={session.data?.member_id}
          memberName={session.data?.member_name}
          dashOpen={dashOpen}
          onOpenDash={() => setDashOpen(true)}
          onCloseDash={() => setDashOpen(false)}
          queueTotal={queueTotal}
        />
      )}

      {data.beauty_reward && !isParent && <BeautyRewardCard reward={data.beauty_reward} />}

    </div>
  );
}
