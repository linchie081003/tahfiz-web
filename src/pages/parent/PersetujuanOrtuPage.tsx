import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../lib/api";
import { friendlyError, useGameToast } from "../../components/game/GameToast";

/** Persetujuan orang tua untuk merekam suara anak (terpisah dari syarat layanan). */
export function PersetujuanOrtuPage() {
  const nav = useNavigate();
  const qc = useQueryClient();
  const toast = useGameToast();
  const [ok, setOk] = useState(false);
  const c = useQuery({ queryKey: ["consent"], queryFn: () => api<{ granted: boolean; retention_days: number }>("/family/consent/recording") });
  const dash = useQuery({ queryKey: ["parent-dashboard"], queryFn: () => api<{ children: unknown[] }>("/parent/dashboard"), retry: false });
  const kids = dash.data?.children.length ?? 1;
  const days = c.data?.retention_days ?? 30;
  const save = useMutation({
    mutationFn: () => api("/family/consent/recording", { method: "POST", body: JSON.stringify({ granted: true }) }),
    onSuccess: () => { qc.invalidateQueries(); toast("Persetujuan tersimpan", "success"); nav(kids === 0 ? "/parent/tambah-anak" : "/parent", { replace: true }); },
    onError: (e) => toast(friendlyError(e), "error"),
  });
  const items: [string, string, string, React.ReactNode][] = [
    ["Untuk apa direkam", "Mengecek bacaan dan hafalan anak, lalu memberi umpan balik.", "bg-teal",
      <svg key="a" width="22" height="22" viewBox="0 0 24 24" fill="#fff" aria-hidden="true"><rect x="8.5" y="2.5" width="7" height="12" rx="3.5" /><path d="M5 11.5a7 7 0 0 0 14 0" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" /><rect x="11" y="18" width="2" height="3.5" rx="1" /></svg>],
    ["Siapa yang mendengar", "Sistem pengecek bacaan, dan guru hanya bila Anda mengizinkan.", "bg-[#1672B5]",
      <svg key="b" width="22" height="22" viewBox="0 0 24 24" fill="#fff" aria-hidden="true"><circle cx="12" cy="8" r="4.2" /><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7z" /></svg>],
    ["Berapa lama disimpan", `Rekaman latihan disimpan ${days} hari lalu dihapus otomatis. Rekaman bisa dihapus kapan saja dari Pengaturan, bagian Privasi suara.`, "bg-gold",
      <svg key="c" width="22" height="22" viewBox="0 0 24 24" fill="#fff" aria-hidden="true"><circle cx="12" cy="12" r="9.5" /><path d="M12 7v5.2l3.2 2" fill="none" stroke="#412402" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg>],
  ];
  return (
    <div className="app-shell flex min-h-screen flex-col gap-4 px-5 pb-8 pt-7">
      <div className="flex gap-1.5" role="img" aria-label="Langkah 2 dari 3">
        <span className="h-2 flex-1 rounded bg-brand" /><span className="h-2 flex-1 rounded bg-brand" /><span className="h-2 flex-1 rounded bg-[#D9D6F0]" />
      </div>
      <header className="mt-1 flex items-center gap-3.5">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-teal">
          <svg width="32" height="32" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.8l8 3v6c0 5-3.5 8.2-8 9.4-4.5-1.2-8-4.4-8-9.4v-6z" fill="#fff" /><path d="M8.5 12l2.5 2.5 4.5-5" fill="none" stroke="#0F766E" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </span>
        <div>
          <p className="text-[13px] font-bold text-muted">Khusus orang tua</p>
          <h1 className="text-[22px] font-extrabold leading-tight">Izin rekaman suara anak</h1>
        </div>
      </header>
      <section className="flex flex-col gap-3.5 rounded-[28px] bg-brand-light p-4">
        {items.map(([t, d, bg, icon]) => (
          <div key={t} className="flex items-start gap-3">
            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${bg}`}>{icon}</span>
            <div><p className="text-[15px] font-extrabold">{t}</p><p className="text-sm font-medium leading-snug text-[#4A5754]">{d}</p></div>
          </div>
        ))}
      </section>
      <label className={`flex cursor-pointer items-start gap-3 rounded-3xl p-3.5 ${ok ? "border-[3px] border-teal bg-[#E6F4F1]" : "border-[3px] border-transparent bg-brand-light"}`}>
        <input type="checkbox" className="h-6 w-6 shrink-0 accent-[#0F766E]" checked={ok} onChange={(e) => setOk(e.target.checked)} />
        <span className="text-sm font-bold leading-snug">Saya orang tua atau wali, dan setuju suara anak direkam untuk pengecekan bacaan</span>
      </label>
      <p className="text-sm font-semibold text-muted">Izin guru mendengar rekaman diberikan terpisah, per guru, di menu Guru.</p>
      <div className="mt-auto flex flex-col gap-2.5">
        <button type="button" disabled={!ok || save.isPending || c.data?.granted} onClick={() => save.mutate()} className="flex h-14 items-center justify-center rounded-pill bg-teal text-lg font-extrabold text-white disabled:opacity-50">
          {c.data?.granted ? "Sudah disetujui" : "Setuju dan lanjut"}
        </button>
        <button type="button" onClick={() => nav(kids === 0 ? "/parent/tambah-anak" : "/parent", { replace: true })} className="min-h-[44px] text-sm font-bold text-brand underline">
          {c.data?.granted ? "Lanjut" : "Nanti saja (rekaman tidak disimpan)"}
        </button>
      </div>
    </div>
  );
}
