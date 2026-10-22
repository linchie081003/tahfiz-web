import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { useChild } from "../../lib/useChild";
import { Btn, Card, Chip, Page, ScreenHead } from "../../components/ui/ui";
import { friendlyError, useGameToast } from "../../components/game/GameToast";

type Msg = { id: string; teacher: string; member: string; body: string; created_at: string; read: boolean };

export function PesanGuruPage() {
  const toast = useGameToast();
  const qc = useQueryClient();
  const { child } = useChild();
  const [text, setText] = useState("");
  const { data } = useQuery({ queryKey: ["messages"], queryFn: () => api<{ messages: Msg[]; unread: number }>("/family/messages") });
  const unread = data?.unread ?? 0;
  useEffect(() => { if (unread) api("/family/messages/read", { method: "POST" }).then(() => setTimeout(() => qc.invalidateQueries({ queryKey: ["messages"] }), 1500)).catch(() => {}); }, [unread, qc]);
  const send = useMutation({
    mutationFn: () => api("/family/messages/reply", { method: "POST", body: JSON.stringify({ member_id: child!.id, body: text }) }),
    onSuccess: () => { setText(""); toast("Pesan terkirim ke guru", "success"); }, onError: (e) => toast(friendlyError(e), "error"),
  });
  const remind = useMutation({
    mutationFn: () => api(`/family/members/${child!.id}/remind-teacher`, { method: "POST" }),
    onSuccess: () => toast("Pengingat dikirim", "success"), onError: (e) => toast(friendlyError(e), "error"),
  });
  return (
    <Page>
      <ScreenHead to="/parent/keluarga" eyebrow="Area orang tua" title="Pesan guru" />
      {(data?.messages ?? []).length === 0 && <Card tone="lav"><p className="font-extrabold">Belum ada pesan</p><p className="text-sm font-semibold text-muted">Catatan dari guru akan muncul di sini.</p></Card>}
      {(data?.messages ?? []).map((m) => (
        <Card key={m.id} tone={m.read ? "plain" : "lav"}>
          <div className="mb-1 flex items-center gap-2"><p className="font-extrabold">{m.teacher}</p>{m.member && <Chip tone="lav">{m.member}</Chip>}{!m.read && <Chip tone="coral">Baru</Chip>}</div>
          <p className="font-semibold text-outline">{m.body}</p>
          <p className="mt-1 text-xs font-semibold text-muted">{new Date(m.created_at).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}</p>
        </Card>
      ))}
      {child && (
        <Card tone="plain">
          <label className="mb-2 block font-extrabold" htmlFor="balas">Balas untuk guru {child.name}</label>
          <textarea id="balas" value={text} onChange={(e) => setText(e.target.value)} maxLength={1000} rows={3} className="mb-3 w-full rounded-[20px] border-[3px] border-line p-3 font-semibold outline-none focus:border-brand" />
          <Btn disabled={!text.trim() || send.isPending} onClick={() => send.mutate()}>Kirim pesan</Btn>
          <Btn variant="outline" className="mt-2" disabled={remind.isPending} onClick={() => remind.mutate()}>Ingatkan guru menilai</Btn>
        </Card>
      )}
    </Page>
  );
}
