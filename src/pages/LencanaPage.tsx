import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { AppPage, PageTitleRow } from "../components/layout/AppPage";
import { api } from "../lib/api";

export function LencanaPage() {
  const { data } = useQuery({
    queryKey: ["gamify"],
    queryFn: () => api<{ badges: { id: string; title: string; description: string; earned: boolean }[] }>("/gamify"),
  });
  return (
    <AppPage>
      <Link to="/" className="text-white underline">
        ← Home
      </Link>
      <PageTitleRow>
        <h1 className="text-2xl font-bold">Lencana</h1>
      </PageTitleRow>
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
