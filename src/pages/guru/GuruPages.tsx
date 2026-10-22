import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api, clearToken } from "../../lib/api";
import { AuthenticatedAudio } from "../../components/AuthenticatedAudio";
import { Avatar, Btn, Card, Chip, Notice, Page, ScreenHead, Segmented } from "../../components/ui/ui";
import { friendlyError, useGameToast } from "../../components/game/GameToast";
import { useTeacher } from "./GuruShell";

type QItem = { id: string; context: string; member_id: string; member_name: string; reference_text: string; ai_insights: { available?: boolean; summaryPercent?: number; reason?: string } | null; created_at: string; due_at: string; overdue: boolean; can_hear: boolean };
type Student = { member_id: string; name: string; tahsin_status: string; recording_consent: boolean; pending: number; overdue: number };

const fmt = (d: string) => new Date(d).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" });
const Empty = ({ t, d }: { t: string; d: string }) => <Card tone="lav"><p className="text-lg font-extrabold">{t}</p><p className="text-sm font-semibold text-muted">{d}</p></Card>;

function Waiting({ kind }: { kind: string }) {
  return (
    <Page>
      <ScreenHead back={false} eyebrow="Akun guru" title="Menunggu verifikasi" />
      <Card tone="cream">
        <p className="font-extrabold text-gold-ink">{kind === "institution" ? "Instansi Anda perlu memverifikasi akun ini." : "Orang tua yang mengundang Anda akan meninjau dokumen dasar Anda."}</p>
        <p className="mt-1 text-sm font-semibold text-gold-ink">Anda belum bisa menerima murid atau menilai setoran sampai akun diverifikasi.</p>
      </Card>
      <DocsForm />
      <Link to="/guru/pengaturan" className="block text-center font-extrabold text-brand">Pengaturan akun</Link>
    </Page>
  );
}

function DocsForm() {
  const toast = useGameToast();
  const qc = useQueryClient();
  const [title, setTitle] = useState(""); const [note, setNote] = useState("");
  const docs = useQuery({ queryKey: ["t-docs"], queryFn: () => api<{ id: string; title: string; note: string }[]>("/teacher/documents") });
  const add = useMutation({
    mutationFn: () => api("/teacher/documents", { method: "POST", body: JSON.stringify({ title, note: note || undefined }) }),
    onSuccess: () => { setTitle(""); setNote(""); qc.invalidateQueries({ queryKey: ["t-docs"] }); toast("Dokumen ditambahkan", "success"); }, onError: (e) => toast(friendlyError(e), "error"),
  });
  return (
    <Card tone="plain">
      <p className="mb-1 text-lg font-extrabold">Dokumen dasar</p>
      <p className="mb-2 text-sm font-semibold text-muted">Mis. ijazah sanad, sertifikat mengajar. Dilihat orang tua; aplikasi tidak memeriksa keaslian.</p>
      {(docs.data ?? []).map((d) => <p key={d.id} className="mb-1 rounded-2xl bg-brand-light px-3 py-2 text-sm font-bold">{d.title}{d.note && <span className="block font-semibold text-muted">{d.note}</span>}</p>)}
      <input className="my-2 min-h-[52px] w-full rounded-pill border-[3px] border-line px-4 font-bold outline-none focus:border-brand" placeholder="Judul dokumen" aria-label="Judul dokumen" value={title} onChange={(e) => setTitle(e.target.value)} />
      <input className="mb-3 min-h-[52px] w-full rounded-pill border-[3px] border-line px-4 font-semibold outline-none focus:border-brand" placeholder="Keterangan (opsional)" aria-label="Keterangan" value={note} onChange={(e) => setNote(e.target.value)} />
      <Btn variant="soft" disabled={!title.trim() || add.isPending} onClick={() => add.mutate()}>Tambah dokumen</Btn>
    </Card>
  );
}

export function GuruBerandaPage() {
  const toast = useGameToast();
  const qc = useQueryClient();
  const me = useTeacher().data!;
  const queue = useQuery({ queryKey: ["t-queue"], queryFn: () => api<QItem[]>("/teacher/queue"), enabled: me.status === "verified" });
  const reqs = useQuery({ queryKey: ["t-req"], queryFn: () => api<{ link_id: string; member_name: string; family_name: string }[]>("/teacher/requests"), enabled: me.status === "verified" });
  const respond = useMutation({
    mutationFn: (v: { id: string; accept: boolean }) => api(`/teacher/requests/${v.id}/respond`, { method: "POST", body: JSON.stringify({ accept: v.accept }) }),
    onSuccess: () => { qc.invalidateQueries(); }, onError: (e) => toast(friendlyError(e), "error"),
  });
  if (me.status === "pending") return <Waiting kind={me.kind} />;
  if (me.status === "rejected") return <Page><ScreenHead back={false} title="Akun ditolak" /><Notice>Verifikasi akun ini ditolak. Hubungi instansi atau keluarga yang mengundang Anda.</Notice></Page>;
  const q = queue.data ?? [];
  const overdue = q.filter((x) => x.overdue).length;
  return (
    <Page>
      <ScreenHead back={false} eyebrow="Assalamu'alaikum" title={me.name} right={<Chip tone="teal">{me.kind === "institution" ? me.institution_name ?? "Instansi" : "Mandiri"}</Chip>} />
      <div className="grid grid-cols-2 gap-3">
        <Card tone="lav"><p className="text-3xl font-extrabold text-brand-dark">{q.length}</p><p className="text-sm font-bold text-muted">Setoran menunggu</p></Card>
        <Card tone={overdue ? "cream" : "mint"}><p className="text-3xl font-extrabold">{overdue}</p><p className="text-sm font-bold text-muted">Lewat target {me.grading_target_hours} jam</p></Card>
      </div>
      {(reqs.data ?? []).map((r) => (
        <Card key={r.link_id} tone="cream">
          <p className="font-extrabold text-gold-ink">Permintaan murid baru</p>
          <p className="text-lg font-extrabold text-outline">{r.member_name} <span className="text-sm font-semibold text-muted">· keluarga {r.family_name}</span></p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <Btn variant="danger-outline" onClick={() => respond.mutate({ id: r.link_id, accept: false })}>Tolak</Btn>
            <Btn variant="teal" onClick={() => respond.mutate({ id: r.link_id, accept: true })}>Terima</Btn>
          </div>
        </Card>
      ))}
      {q.length === 0 ? <Empty t="Tidak ada setoran" d="Setoran murid yang perlu dinilai akan muncul di sini." /> : q.slice(0, 3).map((x) => <QueueRow key={x.id} x={x} />)}
      {q.length > 3 && <Link to="/guru/setoran" className="block text-center font-extrabold text-brand">Lihat semua ({q.length})</Link>}
      <Card tone="plain"><p className="text-sm font-semibold text-muted">Kode guru Anda untuk dibagikan ke orang tua</p><p className="text-2xl font-extrabold tracking-widest text-brand-dark">{me.invite_code}</p></Card>
    </Page>
  );
}

function QueueRow({ x }: { x: QItem }) {
  return (
    <Link to={`/guru/setoran/${x.id}`} className={`flex items-center gap-3 rounded-[24px] p-4 ${x.overdue ? "border-2 border-gold bg-cream" : "bg-brand-light"}`}>
      <Avatar name={x.member_name} />
      <div className="min-w-0 flex-1">
        <p className="font-extrabold text-outline">{x.member_name} <span className="text-sm font-semibold text-muted">· {x.context}</span></p>
        <p className="truncate text-sm font-semibold text-muted">{fmt(x.created_at)} · target {fmt(x.due_at)}</p>
      </div>
      {x.overdue && <Chip tone="coral">Terlambat</Chip>}
      {!x.can_hear && <Chip tone="lav">Terkunci</Chip>}
    </Link>
  );
}

export function GuruAntreanPage() {
  const { data } = useQuery({ queryKey: ["t-queue"], queryFn: () => api<QItem[]>("/teacher/queue") });
  return (
    <Page>
      <ScreenHead back={false} eyebrow="Guru" title="Setoran" />
      {!data?.length ? <Empty t="Tidak ada setoran" d="Semua sudah dinilai. Terima kasih, Ustaz/ustazah." /> : data.map((x) => <QueueRow key={x.id} x={x} />)}
    </Page>
  );
}

const RUBRIC = [["makhraj", "Makhraj / huruf"], ["tajwid", "Tajwid"], ["kelancaran", "Kelancaran"], ["hafalan", "Hafalan tanpa melihat"]];

export function GuruEvaluasiPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const toast = useGameToast();
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["t-queue"], queryFn: () => api<QItem[]>("/teacher/queue") });
  const [scores, setScores] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState("");
  const x = q.data?.find((i) => i.id === id);
  const done = useMutation({
    mutationFn: (status: "passed" | "needs_retry") => api(`/teacher/submissions/${id}/evaluate`, { method: "POST", body: JSON.stringify({ status, rubric_scores: RUBRIC.every(([k]) => scores[k]) ? scores : undefined, evaluator_notes: notes.trim() || undefined }) }),
    onSuccess: (_r, s) => { qc.invalidateQueries(); toast(s === "passed" ? "Dinyatakan lulus" : "Diminta mengulang", "success"); nav("/guru/setoran", { replace: true }); },
    onError: (e) => toast(friendlyError(e), "error"),
  });
  if (!x) return <Page><ScreenHead to="/guru/setoran" title="Setoran" /><Empty t="Setoran tidak ditemukan" d="Mungkin sudah dinilai." /></Page>;
  const ai = x.ai_insights;
  return (
    <Page>
      <ScreenHead to="/guru/setoran" eyebrow={x.context} title={x.member_name} sub={`Disetor ${fmt(x.created_at)}`} />
      <Card tone="plain"><p className="text-right font-quran text-3xl leading-[2.2]" dir="rtl" lang="ar">{x.reference_text}</p></Card>
      {x.can_hear
        ? <Card tone="lav"><p className="mb-2 font-extrabold">Rekaman</p><AuthenticatedAudio url={`/teacher/media/${x.id}`} className="w-full" /><p className="mt-1 text-xs font-semibold text-muted">Pemutaran ini tercatat dan terlihat oleh orang tua.</p></Card>
        : <Notice>Rekaman terkunci. Orang tua belum memberi izin guru mendengar rekaman, atau rekaman sudah dihapus. Anda tidak bisa menilai tanpa mendengar.</Notice>}
      <Card tone="mint">
        <p className="font-extrabold">Bantuan AI (hanya pra-cek)</p>
        <p className="text-sm font-semibold text-muted">{ai?.available ? `Kecocokan kata sekitar ${ai.summaryPercent ?? 0}%. Keputusan tetap di tangan Anda.` : "Pra-cek tidak tersedia. Nilai berdasarkan yang Anda dengar."}</p>
      </Card>
      <Card tone="plain">
        {RUBRIC.map(([k, l]) => (
          <div key={k} className="mb-3">
            <p className="mb-1 font-extrabold">{l}</p>
            <Segmented value={scores[k] ?? 0} onChange={(v) => setScores({ ...scores, [k]: v })} options={[{ id: 1, label: "1" }, { id: 2, label: "2" }, { id: 3, label: "3" }, { id: 4, label: "4" }, { id: 5, label: "5" }]} />
          </div>
        ))}
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Catatan untuk orang tua (opsional)" aria-label="Catatan" className="w-full rounded-[20px] border-[3px] border-line p-3 font-semibold outline-none focus:border-brand" />
      </Card>
      <div className="grid grid-cols-2 gap-2">
        <Btn variant="outline" disabled={!x.can_hear || done.isPending} onClick={() => done.mutate("needs_retry")}>Ulangi</Btn>
        <Btn variant="teal" disabled={!x.can_hear || done.isPending || !RUBRIC.every(([k]) => scores[k])} onClick={() => done.mutate("passed")}>Lulus</Btn>
      </div>
    </Page>
  );
}

export function GuruMuridPage() {
  const { data } = useQuery({ queryKey: ["t-students"], queryFn: () => api<Student[]>("/teacher/students") });
  return (
    <Page>
      <ScreenHead back={false} eyebrow="Guru" title="Murid" />
      {!data?.length ? <Empty t="Belum ada murid" d="Bagikan kode guru Anda ke orang tua. Permintaan masuk akan tampil di Beranda." /> : data.map((s) => (
        <Link key={s.member_id} to={`/guru/murid/${s.member_id}`} className="flex items-center gap-3 rounded-[24px] bg-brand-light p-4">
          <Avatar name={s.name} />
          <div className="min-w-0 flex-1"><p className="font-extrabold">{s.name}</p><p className="text-sm font-semibold text-muted">{s.pending} menunggu{s.overdue ? ` · ${s.overdue} terlambat` : ""}</p></div>
          {!s.recording_consent && <Chip tone="lav">Rekaman terkunci</Chip>}
        </Link>
      ))}
    </Page>
  );
}

type Overview = { points: { point: number; name: string; mandatory: boolean; passed: boolean; best_score: number; approved_below_threshold: boolean }[]; gate_open: boolean; threshold: number };
type Settings = { daily_ayahs: number; murajaah_strong_days: number; set_by: string };

export function GuruMuridDetailPage() {
  const { id } = useParams();
  const toast = useGameToast();
  const qc = useQueryClient();
  const [score, setScore] = useState<Record<number, string>>({});
  const [msg, setMsg] = useState("");
  const ov = useQuery({ queryKey: ["t-points", id], queryFn: () => api<Overview>(`/teacher/students/${id}/points`) });
  const st = useQuery({ queryKey: ["t-set", id], queryFn: () => api<Settings>(`/teacher/students/${id}/settings`) });
  const name = useQuery({ queryKey: ["t-students"], queryFn: () => api<Student[]>("/teacher/students") }).data?.find((s) => s.member_id === id)?.name ?? "Murid";
  const fail = (e: unknown) => toast(friendlyError(e), "error");
  const result = useMutation({
    mutationFn: (v: { p: number; s: number; below: boolean }) => api(`/teacher/students/${id}/points/${v.p}/result`, { method: "POST", body: JSON.stringify({ score: v.s, approve_below_threshold: v.below }) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["t-points", id] }); toast("Nilai tersimpan", "success"); }, onError: fail,
  });
  const save = useMutation({
    mutationFn: (b: Partial<Settings>) => api(`/teacher/students/${id}/settings`, { method: "PUT", body: JSON.stringify(b) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["t-set", id] }); toast("Pengaturan disimpan", "success"); }, onError: fail,
  });
  const send = useMutation({
    mutationFn: () => api(`/teacher/students/${id}/messages`, { method: "POST", body: JSON.stringify({ body: msg }) }),
    onSuccess: () => { setMsg(""); toast("Catatan terkirim ke orang tua", "success"); }, onError: fail,
  });
  return (
    <Page>
      <ScreenHead to="/guru/murid" eyebrow="Murid" title={name} />
      <Card tone="lav">
        <p className="mb-2 text-lg font-extrabold">Sembilan Pulau tahsin</p>
        <p className="mb-2 text-sm font-semibold text-muted">Lulus bila nilai ≥ {ov.data?.threshold ?? 8} dari 10. Anda boleh meluluskan di bawah ambang.</p>
        <div className="space-y-2">
          {(ov.data?.points ?? []).map((p) => (
            <div key={p.point} className="rounded-[20px] bg-white p-3">
              <div className="flex items-center gap-2">
                <p className="min-w-0 flex-1 font-extrabold">{p.point}. {p.name}</p>
                {p.passed ? <Chip tone="teal">Lulus {p.best_score}{p.approved_below_threshold ? " *" : ""}</Chip> : <Chip tone="lav">Belum</Chip>}
              </div>
              {!p.passed && (
                <div className="mt-2 flex items-center gap-2">
                  <input inputMode="decimal" aria-label={`Nilai Pulau ${p.point}`} placeholder="0–10" value={score[p.point] ?? ""} onChange={(e) => setScore({ ...score, [p.point]: e.target.value })} className="min-h-[48px] w-24 rounded-pill border-[3px] border-line px-3 text-center font-extrabold outline-none focus:border-brand" />
                  <Btn variant="soft" className="!min-h-[48px] !text-base" disabled={!(Number(score[p.point]) >= 0 && score[p.point])} onClick={() => { const s = Number(score[p.point]); result.mutate({ p: p.point, s, below: s < (ov.data?.threshold ?? 8) }); }}>Simpan nilai</Btn>
                </div>
              )}
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs font-semibold text-muted">* diluluskan guru di bawah ambang</p>
      </Card>
      {st.data && (
        <Card tone="plain">
          <p className="mb-2 text-lg font-extrabold">Kecepatan hafalan</p>
          <Segmented value={st.data.daily_ayahs} onChange={(v) => save.mutate({ daily_ayahs: v })} options={[1, 2, 3, 5].map((n) => ({ id: n, label: `${n}`, hint: "ayat/hari" }))} />
          <p className="mb-2 mt-4 text-lg font-extrabold">Murajaah “Kuat” kembali setelah</p>
          <Segmented value={st.data.murajaah_strong_days} onChange={(v) => save.mutate({ murajaah_strong_days: v })} options={[{ id: 7, label: "7 hari" }, { id: 14, label: "14 hari" }]} />
          <p className="mt-2 text-xs font-semibold text-muted">Diatur oleh: {st.data.set_by === "teacher" ? "guru" : "orang tua"}</p>
        </Card>
      )}
      <Card tone="plain">
        <textarea value={msg} onChange={(e) => setMsg(e.target.value)} rows={3} maxLength={1000} placeholder="Catatan untuk orang tua" aria-label="Catatan untuk orang tua" className="mb-3 w-full rounded-[20px] border-[3px] border-line p-3 font-semibold outline-none focus:border-brand" />
        <Btn disabled={!msg.trim() || send.isPending} onClick={() => send.mutate()}>Kirim catatan</Btn>
      </Card>
    </Page>
  );
}

export function GuruPengaturanPage() {
  const nav = useNavigate();
  const toast = useGameToast();
  const qc = useQueryClient();
  const me = useTeacher().data!;
  const inbox = useQuery({ queryKey: ["t-inbox"], queryFn: () => api<{ id: string; kind: string; body: string; created_at: string }[]>("/teacher/inbox") });
  const target = useMutation({
    mutationFn: (h: number) => api("/teacher/me/target", { method: "PUT", body: JSON.stringify({ grading_target_hours: h }) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["teacher-me"] }); toast("Target tersimpan", "success"); }, onError: (e) => toast(friendlyError(e), "error"),
  });
  return (
    <Page>
      <ScreenHead to="/guru" eyebrow="Guru" title="Pengaturan" />
      <Card tone="lav"><p className="font-extrabold">{me.name}</p><p className="text-sm font-semibold text-muted">{me.email} · {me.kind === "institution" ? me.institution_name : "Guru mandiri"}</p>
        <p className="mt-2 text-sm font-semibold text-muted">Kode guru</p><p className="text-2xl font-extrabold tracking-widest text-brand-dark">{me.invite_code}</p></Card>
      <Card tone="plain">
        <p className="mb-2 text-lg font-extrabold">Target waktu menilai</p>
        <Segmented value={me.grading_target_hours} onChange={(v) => target.mutate(v)} options={[24, 48, 72].map((h) => ({ id: h, label: `${h} jam` }))} />
      </Card>
      {me.status === "pending" && <DocsForm />}
      <Card tone="plain">
        <p className="mb-1 text-lg font-extrabold">Pesan dari orang tua</p>
        {!inbox.data?.length ? <p className="text-sm font-semibold text-muted">Belum ada pesan.</p> : inbox.data.slice(0, 10).map((m) => <p key={m.id} className="mb-1 rounded-2xl bg-brand-light px-3 py-2 text-sm font-semibold">{m.kind === "reminder" && <Chip tone="coral">Pengingat</Chip>} {m.body}</p>)}
      </Card>
      <Btn variant="danger-outline" onClick={() => { clearToken(); qc.clear(); nav("/guru/masuk", { replace: true }); }}>Keluar</Btn>
    </Page>
  );
}
