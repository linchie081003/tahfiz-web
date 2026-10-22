import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../lib/api";
import { useChild } from "../../lib/useChild";
import { Btn, Card, Notice, Page, ScreenHead } from "../../components/ui/ui";
import { Mascot } from "../../components/game/Mascot";
import { friendlyError, useGameToast } from "../../components/game/GameToast";

type Link_ = { id: string; status: string; reject_reason: string | null; grading_target_hours: number; overdue: number; teacher: { name: string } };

function useLink() {
  const { child } = useChild();
  const q = useQuery({ queryKey: ["teacher-link", child?.id], enabled: !!child, queryFn: () => api<{ link: Link_ | null }>(`/family/members/${child!.id}/teacher`) });
  return { child, link: q.data?.link ?? null };
}

/** Permintaan ditolak guru. */
export function OrtuDitolakGuruPage() {
  const nav = useNavigate();
  const { child, link } = useLink();
  return (
    <Page>
      <ScreenHead to="/parent/guru" eyebrow="Area orang tua" title="Status permintaan" />
      <Card tone="cream">
        <p className="text-xl font-extrabold text-outline">{link?.teacher.name ?? "Guru"} belum bisa menerima {child?.name ?? "anak"}</p>
        <p className="mt-2 text-sm font-bold text-gold-ink">Alasan dari guru</p>
        <p className="font-semibold">{link?.reject_reason ?? "Tidak ada alasan yang ditulis."}</p>
      </Card>
      <Card tone="lav" className="space-y-2 font-semibold">
        <p><b>Data {child?.name} tidak dibagikan.</b> Guru ini tidak melihat data atau rekaman.</p>
        <p><b>Belajar tetap berjalan.</b> {child?.name} terus berlatih dalam mode mandiri.</p>
      </Card>
      <Btn onClick={() => nav("/parent/guru")}>Cari guru lain</Btn>
      <Btn variant="outline" onClick={() => nav("/parent/keluarga")}>Lanjut mode mandiri</Btn>
    </Page>
  );
}

/** Guru belum merespons: garis waktu dan pilihan. */
export function OrtuGuruMenungguPage() {
  const nav = useNavigate();
  const toast = useGameToast();
  const { child, link } = useLink();
  const remind = useMutation({
    mutationFn: () => api(`/family/members/${child!.id}/remind-teacher`, { method: "POST" }),
    onSuccess: () => nav("/parent/pengingat", { replace: true }), onError: (e) => toast(friendlyError(e), "error"),
  });
  return (
    <Page>
      <ScreenHead to="/parent/guru" eyebrow="Area orang tua" title="Menunggu guru" />
      <Card tone="cream">
        <p className="text-lg font-extrabold">{link ? `${link.teacher.name} belum menilai ${link.overdue || 1} setoran` : "Belum ada guru aktif"}</p>
        <p className="text-sm font-semibold text-gold-ink">Target penilaian {link?.grading_target_hours ?? 48} jam sudah terlewati.</p>
      </Card>
      <Card tone="plain" className="space-y-2">
        <p className="font-extrabold">Garis waktu</p>
        {["Setoran dikirim", `Batas ${link?.grading_target_hours ?? 48} jam terlewati`, "Belum dibalas"].map((t, i) => (
          <div key={t} className="flex items-center gap-3"><span className={`h-3 w-3 rounded-full ${i === 2 ? "bg-coral" : "bg-teal"}`} /><p className="font-bold">{t}</p></div>
        ))}
      </Card>
      <Notice tone="lav">{child?.name} tetap bisa berlatih selagi menunggu.</Notice>
      <Btn disabled={!child || remind.isPending} onClick={() => remind.mutate()}>Ingatkan guru lagi</Btn>
      <Btn variant="outline" onClick={() => nav("/parent/guru")}>Cari guru lain</Btn>
      <Btn variant="soft" onClick={() => nav("/parent/keluarga")}>Terus menunggu</Btn>
    </Page>
  );
}

export function PengingatTerkirimPage() {
  const nav = useNavigate();
  return (
    <Page>
      <div className="space-y-3 pt-8 text-center">
        <Mascot mood="happy" size={96} className="mx-auto" />
        <h1 className="text-2xl font-extrabold">Pengingat terkirim</h1>
        <p className="text-lg font-bold text-muted">Guru sudah diingatkan. Jika 48 jam lagi belum ada jawaban, Anda boleh memilih guru lain.</p>
      </div>
      <Btn onClick={() => nav("/parent")}>Kembali ke beranda</Btn>
      <Link to="/parent/guru" className="block min-h-[48px] text-center text-lg font-extrabold leading-[48px] text-brand">Cari guru lain</Link>
    </Page>
  );
}

export function HapusBerhasilPage() {
  const nav = useNavigate();
  return (
    <Page>
      <div className="space-y-3 pt-8 text-center">
        <Mascot mood="happy" size={96} className="mx-auto" />
        <h1 className="text-2xl font-extrabold">Rekaman dihapus</h1>
        <p className="text-lg font-bold text-muted">Rekaman sudah hilang dari aplikasi. Penghapusan permanen dari penyimpanan selesai dalam 7 hari. Guru tidak lagi bisa mendengarnya.</p>
        <p className="font-semibold text-muted">Bintang, sertifikat, dan status hafalan tetap ada.</p>
      </div>
      <Btn onClick={() => nav("/parent/keluarga")}>Kembali ke pengaturan</Btn>
      <Btn variant="outline" onClick={() => nav("/parent/privasi")}>Ke privasi suara</Btn>
    </Page>
  );
}

