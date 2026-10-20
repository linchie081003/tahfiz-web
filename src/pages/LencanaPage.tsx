import { useQuery } from "@tanstack/react-query";
import { GameHeader } from "../components/game/GameHeader";
import { AppPage } from "../components/layout/AppPage";
import { api } from "../lib/api";

export function LencanaPage() {
  const { data } = useQuery({
    queryKey: ["gamify"],
    queryFn: () => api<{ badges: { id: string; title: string; description: string; earned: boolean }[] }>("/gamify"),
  });
  return (
    <AppPage>
      <GameHeader title="Lencana" to="/" />
      <div className="space-y-2">
        {data?.badges.map((b) => (
          <div key={b.id} className={`card-surface p-3 ${b.earned ? "" : "opacity-50"}`}>
            <p className="font-bold">{b.title}</p>
            <p className="text-sm text-gray-600">{b.description}</p>
          </div>
        ))}
      </div>
    </AppPage>
  );
}
