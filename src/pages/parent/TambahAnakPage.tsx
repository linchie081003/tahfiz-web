import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../lib/api";
import { Btn, Card, Page, ScreenHead } from "../../components/ui/ui";
import { friendlyError, useGameToast } from "../../components/game/GameToast";

const AGES = [{ id: "5-6", mode: "paud" }, { id: "7-8", mode: "sd" }, { id: "9-10", mode: "sd" }, { id: "11-12", mode: "teen" }];

/** Tambah anak: nama panggilan, usia, dan kode guru atau instansi (boleh kosong). */
export function TambahAnakPage() {
  const nav = useNavigate();
  const qc = useQueryClient();
  const toast = useGameToast();
  const [name, setName] = useState("");
  const [age, setAge] = useState("7-8");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const save = async () => {
    setBusy(true);
    try {
      const m = await api<{ id: string }>("/members", { method: "POST", body: JSON.stringify({ name: name.trim(), age_mode: AGES.find((a) => a.id === age)!.mode }) });
      if (code.trim()) {
        try { await api("/family/teachers/connect", { method: "POST", body: JSON.stringify({ code: code.trim().toUpperCase(), member_id: m.id }) }); }
        catch (e) { toast(`Anak ditambahkan, tetapi kode guru belum berhasil: ${friendlyError(e)}`, "error"); }
      }
      await qc.invalidateQueries();
      nav("/parent", { replace: true });
    } catch (e) { toast(friendlyError(e), "error"); } finally { setBusy(false); }
  };
  return (
    <Page>
      <ScreenHead eyebrow="Tambah anak" title="Siapa yang akan belajar?" sub="Anak lain bisa ditambahkan nanti di pengaturan." />
      <Card tone="plain">
        <label htmlFor="nm" className="font-extrabold">Nama panggilan anak</label>
        <p className="mb-2 text-sm font-semibold text-muted">Pakai nama panggilan saja, tidak perlu nama lengkap.</p>
        <input id="nm" value={name} onChange={(e) => setName(e.target.value)} maxLength={40} className="min-h-[56px] w-full rounded-pill border-[3px] border-line px-5 text-lg font-bold outline-none focus:border-brand" />
      </Card>
      <Card tone="plain">
        <p className="mb-2 font-extrabold">Usia</p>
        <div className="grid grid-cols-4 gap-2" role="radiogroup">
          {AGES.map((a) => <button key={a.id} type="button" role="radio" aria-checked={age === a.id} onClick={() => setAge(a.id)} className={`min-h-[52px] rounded-pill text-lg font-extrabold ${age === a.id ? "bg-brand text-white" : "bg-lav text-brand-dark"}`}>{a.id}</button>)}
        </div>
      </Card>
      <Card tone="plain">
        <label htmlFor="kd" className="font-extrabold">Kode guru atau instansi</label>
        <p className="mb-2 text-sm font-semibold text-muted">Boleh dikosongkan. Tanpa guru, anak tetap bisa belajar dengan bantuan AI. Guru bisa ditambahkan kapan saja.</p>
        <input id="kd" value={code} onChange={(e) => setCode(e.target.value)} maxLength={12} className="min-h-[56px] w-full rounded-pill border-[3px] border-line px-5 text-center text-lg font-extrabold uppercase tracking-widest outline-none focus:border-brand" />
      </Card>
      <Btn disabled={!name.trim() || busy} onClick={save}>Mulai belajar</Btn>
    </Page>
  );
}
