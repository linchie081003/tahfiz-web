import { useNavigate } from "react-router-dom";
import { IconBack } from "../icons/GameIcons";

/** Header halaman sesuai desain: tombol kembali koral bulat + judul putih bergaris. */
export function GameHeader({ title, to, right }: { title: string; to?: string; right?: React.ReactNode }) {
  const nav = useNavigate();
  return (
    <div className="relative flex min-h-[48px] items-center justify-center">
      <button
        type="button"
        onClick={() => (to ? nav(to) : nav(-1))}
        aria-label="Kembali"
        className="absolute left-0 flex h-11 w-11 items-center justify-center rounded-full border-[3px] border-outline bg-[#FF7A59] shadow-game-sm active:translate-y-[2px]"
      >
        <IconBack size={26} decorative />
      </button>
      <h1 className="game-text-stroke px-14 text-center text-2xl font-extrabold leading-tight">{title}</h1>
      {right && <div className="absolute right-0">{right}</div>}
    </div>
  );
}
