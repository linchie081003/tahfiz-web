import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../lib/api";
import { Mascot } from "../components/game/Mascot";
import { Btn } from "../components/ui/ui";

type Pts = { points: { point: number; name: string; passed: boolean; decided_by: string | null }[] };

/** Sertifikat pulau tahsin: muncul setelah satu pulau disetujui orang tua atau guru. */
export function SertifikatPage() {
  const { point } = useParams();
  const nav = useNavigate();
  const pts = useQuery({ queryKey: ["tahsin-points"], queryFn: () => api<Pts>("/tahsin/points") });
  const session = useQuery({ queryKey: ["session"], queryFn: () => api<{ member_name?: string | null }>("/auth/session") });
  const p = pts.data?.points.find((x) => String(x.point) === point);
  if (!p) return <p className="p-8 text-center font-extrabold text-muted">Memuat…</p>;
  if (!p.passed) return <div className="p-8 text-center"><p className="text-xl font-extrabold">Pulau ini belum selesai</p><div className="mt-4"><Btn onClick={() => nav("/peta")}>Kembali ke peta</Btn></div></div>;
  const by = p.decided_by === "teacher" ? "Guru" : "Orang tua";
  return (
    <div className="space-y-4 px-4 pb-28 pt-6 text-center">
      <Mascot mood="excited" size={88} className="mx-auto" />
      <h1 className="text-[28px] font-extrabold text-outline">Pulau selesai!</h1>
      <p className="text-lg font-bold text-muted">Kamu hebat sudah berlatih setiap hari</p>
      <div className="rounded-[28px] border-[3px] border-gold bg-cream p-6" role="img" aria-label={`Sertifikat Pulau ${p.point}`}>
        <p className="text-sm font-extrabold tracking-widest text-gold-ink">SERTIFIKAT TAHSIN</p>
        <p className="mt-3 text-sm font-semibold text-muted">Diberikan kepada</p>
        <p className="text-3xl font-extrabold text-outline">{session.data?.member_name ?? "Pelajar Hafiz"}</p>
        <p className="mt-3 text-sm font-semibold text-muted">telah menyelesaikan</p>
        <p className="text-xl font-extrabold text-brand-dark">Pulau {p.point}: {p.name}</p>
        <div className="mt-4 flex justify-between text-left text-sm font-bold text-muted">
          <div><p>Disetujui</p><p className="text-outline">{by}</p></div>
          <div className="text-right"><p>Tanggal</p><p className="text-outline">{new Date().toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</p></div>
        </div>
      </div>
      <div className="space-y-2">
        <Btn onClick={() => { const t = `${session.data?.member_name ?? "Anakku"} menyelesaikan Pulau ${p.point}: ${p.name} di Hafiz`; if (navigator.share) void navigator.share({ text: t }).catch(() => {}); else void navigator.clipboard?.writeText(t); }}>Bagikan ke orang tua</Btn>
        <Btn variant="outline" onClick={() => nav("/peta")}>Kembali ke peta</Btn>
      </div>
    </div>
  );
}
