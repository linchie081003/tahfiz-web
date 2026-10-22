import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { api } from "../../lib/api";
import { useLogout } from "../../lib/auth";
import { Btn, Card, Chip, Page, ScreenHead } from "../../components/ui/ui";
import { FamilyParents } from "../../components/FamilyParents";

const ROWS = [
  { to: "/parent/tambah-anak", t: "Tambah anak", d: "Daftarkan anak lain untuk belajar" },
  { to: "/parent/guru", t: "Guru", d: "Hubungkan, tinjau, atau ganti guru" },
  { to: "/parent/privasi", t: "Privasi suara", d: "Izin rekaman, hapus, dan unduh data" },
  { to: "/parent/pesan", t: "Pesan guru", d: "Catatan dari guru untuk keluarga" },
  { to: "/parent/instansi", t: "Pindah instansi", d: "Gabung ke sekolah atau lembaga" },
  { to: "/settings", t: "Pengaturan belajar", d: "Kecepatan hafalan dan murajaah" },
];

export function OrtuHubPage() {
  const logout = useLogout();
  const msgs = useQuery({ queryKey: ["messages"], queryFn: () => api<{ unread: number }>("/family/messages") });
  return (
    <Page>
      <ScreenHead back={false} eyebrow="Area orang tua" title="Keluarga" />
      <Card tone="plain"><FamilyParents /></Card>
      <div className="space-y-2">
        {ROWS.map((r) => (
          <Link key={r.to} to={r.to} className="flex min-h-[64px] items-center gap-3 rounded-[24px] bg-brand-light px-4 py-3">
            <div className="min-w-0 flex-1">
              <p className="text-lg font-extrabold text-outline">{r.t}</p>
              <p className="text-sm font-semibold text-muted">{r.d}</p>
            </div>
            {r.to === "/parent/pesan" && !!msgs.data?.unread && <Chip tone="coral">{msgs.data.unread} baru</Chip>}
            <span className="text-2xl font-extrabold text-brand" aria-hidden="true">›</span>
          </Link>
        ))}
      </div>
      <Btn variant="outline" onClick={logout}>Keluar</Btn>
    </Page>
  );
}
