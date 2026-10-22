import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mascot } from "../components/game/Mascot";

const Arrow = () => (
  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-white bg-white/20">
    <svg fill="#fff" width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.2v13.6a1 1 0 0 0 1.5.85l10.8-6.8a1 1 0 0 0 0-1.7L9.5 4.35A1 1 0 0 0 8 5.2z" /></svg>
  </span>
);

function RoleCard({ bg, color, title, sub, icon, onClick }: { bg: string; color: string; title: string; sub: string; icon: React.ReactNode; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex min-h-[84px] w-full items-center gap-3.5 rounded-pill py-3 pl-3 pr-4 text-left text-white" style={{ background: bg }}>
      <span className="flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-full border-4 border-white/45 bg-white" style={{ color }}>{icon}</span>
      <span className="flex-1">
        <span className="block text-[19px] font-extrabold">{title}</span>
        <span className="block text-[13px] font-bold">{sub}</span>
      </span>
      <Arrow />
    </button>
  );
}

/** Layar awal: pilih peran (anak, orang tua, guru), kode undangan, dan daftar. */
export function LoginChooser({ onChild, onParent, onRegister }: { onChild: () => void; onParent: () => void; onRegister: () => void }) {
  const nav = useNavigate();
  const [kode, setKode] = useState("");
  return (
    <div className="app-shell flex min-h-dvh flex-col gap-4 bg-white px-5 pb-6">
      <header className="relative -mx-5 flex flex-col items-center gap-2 overflow-hidden bg-[#FFE680] px-5 pb-5 pt-8 text-center">
        <svg aria-hidden="true" width="390" height="40" viewBox="0 0 390 40" className="absolute bottom-0 left-0 w-full"><path d="M0 24 Q50 14 100 24 T200 24 T300 24 T390 24 V40 H0Z" fill="#F2B01E" opacity=".45" /></svg>
        <Mascot mood="happy" size={80} className="relative" />
        <h1 className="relative text-[26px] font-extrabold leading-tight text-outline">Assalamu'alaikum</h1>
        <p className="relative text-[15px] font-bold text-[#5A4300]">Masuk sebagai siapa hari ini?</p>
      </header>

      <nav aria-label="Pilih peran" className="flex flex-col gap-3">
        <RoleCard bg="#0F766E" color="#0F766E" title="Aku mau belajar" sub="Untuk anak" onClick={onChild}
          icon={<svg fill="currentColor" width="28" height="28" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="7.5" r="4.5" /><path d="M3.5 21a8.5 8.5 0 0 1 17 0z" /></svg>} />
        <RoleCard bg="#4F46B5" color="#4F46B5" title="Orang tua" sub="Pantau dan dampingi anak" onClick={onParent}
          icon={<svg fill="currentColor" width="28" height="28" viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="7.5" r="4" /><path d="M1.5 20.5a7.5 7.5 0 0 1 15 0z" /><circle cx="17.5" cy="9" r="3" /><path d="M15.2 13.9c4-.5 7.3 1.4 7.3 6.6h-4.6c0-2.7-.8-4.8-2.7-6.6z" /></svg>} />
        <RoleCard bg="#6C63C9" color="#6C63C9" title="Guru" sub="Nilai setoran murid" onClick={() => nav("/guru/masuk")}
          icon={<svg fill="currentColor" width="28" height="28" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 6a3 3 0 0 1 3-3h10a1 1 0 0 1 1 1v13H8a1 1 0 0 0 0 2h11v1a1 1 0 0 1-1 1H8a3 3 0 0 1-3-3z" /></svg>} />
      </nav>

      <section className="flex flex-col gap-2 rounded-[28px] bg-brand-light px-4 py-3.5">
        <label htmlFor="kode" className="text-[15px] font-extrabold">Punya kode undangan?</label>
        <p className="text-[13px] font-bold leading-snug text-[#5B5880]">Dari guru atau instansi (sekolah, TPQ, pesantren) untuk bergabung.</p>
        <div className="flex gap-2">
          <input id="kode" value={kode} onChange={(e) => setKode(e.target.value)} placeholder="Contoh: TPQ-4821" className="h-[52px] min-w-0 flex-1 rounded-pill border-2 border-[#C9C5E0] bg-white px-[18px] text-base font-bold text-outline" />
          <button type="button" disabled={!kode.trim()} onClick={() => nav(`/guru/daftar?kode=${encodeURIComponent(kode.trim())}`)} className="h-[52px] rounded-pill bg-teal px-5 text-[15px] font-extrabold text-white disabled:opacity-50">Gabung</button>
        </div>
      </section>

      <button type="button" onClick={onRegister} className="mt-auto flex h-14 items-center justify-center rounded-pill border-[3px] border-brand bg-white text-base font-extrabold text-brand-dark">Belum punya akun? Daftar</button>
      <p className="text-center text-xs font-bold leading-normal text-muted">Anak masuk lewat akun keluarga. Satu keluarga bisa punya beberapa anak dan beberapa guru.</p>
    </div>
  );
}
