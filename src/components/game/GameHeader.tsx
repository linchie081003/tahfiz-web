import { useNavigate } from "react-router-dom";

/** Header halaman: tombol kembali indigo 44px + judul. */
export function GameHeader({ title, to, right }: { title: string; to?: string; right?: React.ReactNode }) {
  const nav = useNavigate();
  return (
    <div className="relative flex min-h-[48px] items-center justify-center">
      <button
        type="button"
        onClick={() => (to ? nav(to) : nav(-1))}
        aria-label="Kembali"
        className="absolute left-0 flex h-11 w-11 items-center justify-center rounded-full text-brand"
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M15 5l-7 7 7 7" />
        </svg>
      </button>
      <h1 className="px-14 text-center text-2xl font-extrabold leading-tight text-outline">{title}</h1>
      {right && <div className="absolute right-0">{right}</div>}
    </div>
  );
}
