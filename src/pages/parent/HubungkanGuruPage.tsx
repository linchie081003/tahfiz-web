import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "../../lib/api";
import { useChild } from "../../lib/useChild";
import { Avatar, Btn, Card, Chip, Notice, Page, ScreenHead, Toggle } from "../../components/ui/ui";
import { friendlyError, useGameToast } from "../../components/game/GameToast";

type Link = { id: string; status: string; recording_consent: boolean; reject_reason: string | null; grading_target_hours: number; overdue: number; teacher: { name: string; kind: string; status: string } };
type Review = { link_id: string; member_name: string; teacher: { name: string; documents: { id: string; title: string; note: string }[] } };

export function HubungkanGuruPage() {
  const toast = useGameToast();
  const qc = useQueryClient();
  const { children, child, select } = useChild();
  const [code, setCode] = useState("");
  const teacher = useQuery({ queryKey: ["teacher-link", child?.id], enabled: !!child, queryFn: () => api<{ link: Link | null }>(`/family/members/${child!.id}/teacher`) });
  const review = useQuery({ queryKey: ["teacher-review"], queryFn: () => api<Review[]>("/family/teachers/review") });
  const consent = useQuery({ queryKey: ["consent"], queryFn: () => api<{ granted: boolean }>("/family/consent/recording") });
  const done = (msg: string) => { qc.invalidateQueries(); toast(msg, "success"); };
  const act = useMutation({
    mutationFn: (fn: () => Promise<unknown>) => fn(),
    onError: (e) => toast(friendlyError(e), "error"),
  });
  const link = teacher.data?.link;
  const post = (p: string, body?: unknown, m = "POST") => api(p, { method: m, body: body ? JSON.stringify(body) : undefined });

  return (
    <Page>
      <ScreenHead to="/parent/keluarga" eyebrow="Area orang tua" title="Guru" />
      <div className="flex gap-2 overflow-x-auto">
        {children.map((c) => (
          <button key={c.id} type="button" onClick={() => select(c.id)} className={`flex shrink-0 items-center gap-2 rounded-pill px-3 py-1.5 font-extrabold ${child?.id === c.id ? "bg-brand text-white" : "bg-lav text-brand-dark"}`}>
            <Avatar name={c.name} color={c.color} size={28} />{c.name}
          </button>
        ))}
      </div>

      {(review.data ?? []).map((r) => (
        <Card key={r.link_id} tone="cream">
          <p className="font-extrabold text-gold-ink">Tinjau guru untuk {r.member_name}</p>
          <p className="text-lg font-extrabold text-outline">{r.teacher.name}</p>
          <p className="mb-2 text-sm font-semibold text-gold-ink">Guru mandiri. Lihat dokumen dasar di bawah; aplikasi tidak memeriksa keaslian dokumen.</p>
          <ul className="mb-3 space-y-1">
            {r.teacher.documents.length === 0 && <li className="text-sm font-semibold">Belum ada dokumen.</li>}
            {r.teacher.documents.map((d) => <li key={d.id} className="rounded-2xl bg-white px-3 py-2 text-sm"><b>{d.title}</b>{d.note && <span className="block text-muted">{d.note}</span>}</li>)}
          </ul>
          <div className="grid grid-cols-2 gap-2">
            <Btn variant="danger-outline" onClick={() => act.mutate(async () => { await post(`/family/links/${r.link_id}/review`, { approve: false }); done("Guru ditolak"); })}>Tolak</Btn>
            <Btn variant="teal" onClick={() => act.mutate(async () => { await post(`/family/links/${r.link_id}/review`, { approve: true }); done("Guru disetujui"); })}>Setujui</Btn>
          </div>
        </Card>
      ))}

      {link && link.status !== "rejected" && (
        <Card tone="lav">
          <div className="flex items-center gap-3">
            <Avatar name={link.teacher.name} color="#4F46B5" size={52} />
            <div className="min-w-0 flex-1">
              <p className="text-xl font-extrabold text-outline">{link.teacher.name}</p>
              <div className="mt-1 flex flex-wrap gap-1.5">
                <Chip tone={link.status === "active" ? "teal" : "gold"}>{link.status === "active" ? "Aktif" : "Menunggu"}</Chip>
                <Chip tone="lav">{link.teacher.kind === "institution" ? "Guru instansi" : "Guru mandiri"}</Chip>
              </div>
            </div>
          </div>
          {link.status === "requested" && <p className="mt-3 text-sm font-semibold text-muted">Permintaan terkirim. Menunggu guru menerima {child?.name}.</p>}
          {link.status === "active" && (
            <>
              <p className="mt-3 text-sm font-semibold text-muted">Target penilaian: {link.grading_target_hours} jam. {link.overdue > 0 ? `${link.overdue} setoran melewati target.` : "Tidak ada yang terlambat."}</p>
              <div className="mt-3 flex items-center gap-3 rounded-[20px] bg-white p-3">
                <div className="min-w-0 flex-1">
                  <p className="font-extrabold">Guru boleh mendengar rekaman</p>
                  <p className="text-xs font-semibold text-muted">{consent.data?.granted ? "Setiap pemutaran tercatat dan dapat Anda lihat." : "Aktifkan izin rekaman suara anak dulu di Privasi suara."}</p>
                </div>
                <Toggle label="Izin guru mendengar rekaman" on={link.recording_consent} disabled={!consent.data?.granted}
                  onChange={(v) => act.mutate(async () => { await post(`/family/links/${link.id}/consent`, { granted: v }); done(v ? "Izin diberikan" : "Izin dicabut"); })} />
              </div>
            </>
          )}
          <Btn variant="danger-outline" className="mt-3" onClick={() => { if (window.confirm(`Ganti guru ${child?.name}? Guru lama tidak lagi bisa mengakses rekaman.`)) act.mutate(async () => { await post(`/family/links/${link.id}/revoke`); done("Guru dilepas"); }); }}>
            {link.status === "active" ? "Ganti guru" : "Batalkan permintaan"}
          </Btn>
        </Card>
      )}

      {link?.status === "rejected" && <Notice>Permintaan ditolak{link.reject_reason ? `: ${link.reject_reason}` : ""}. Coba kode guru lain.</Notice>}

      {(!link || link.status === "rejected") && child && (
        <Card tone="plain">
          <p className="text-lg font-extrabold text-outline">Hubungkan guru untuk {child.name}</p>
          <p className="mb-3 text-sm font-semibold text-muted">Minta kode dari guru. Hanya pemilik keluarga yang dapat menghubungkan.</p>
          <input value={code} onChange={(e) => setCode(e.target.value.trim().toUpperCase())} placeholder="Kode guru" aria-label="Kode guru" maxLength={12}
            className="mb-3 min-h-[56px] w-full rounded-pill border-[3px] border-line px-5 text-center text-xl font-extrabold tracking-widest outline-none focus:border-brand" />
          <Btn disabled={code.length < 4 || act.isPending} onClick={() => act.mutate(async () => { await post("/family/teachers/connect", { code, member_id: child.id }); setCode(""); done("Permintaan terkirim"); })}>Kirim permintaan</Btn>
        </Card>
      )}
    </Page>
  );
}
