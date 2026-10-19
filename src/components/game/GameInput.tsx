import { useState } from "react";
import { IconEye, IconEyeOff, IconMail } from "../icons/GameIcons";

export function GameInput({
  leftIcon = "mail",
  type = "text",
  className = "",
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement> & { leftIcon?: "mail" | "none" }) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && show ? "text" : type;

  return (
    <div className={`relative ${className}`}>
      {leftIcon === "mail" && (
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
          <IconMail size={22} decorative />
        </span>
      )}
      <input
        {...rest}
        type={inputType}
        className={`w-full rounded-game border-[3px] border-outline bg-white py-3 ${leftIcon === "mail" ? "pl-12" : "pl-4"} ${isPassword ? "pr-12" : "pr-4"} font-semibold text-outline shadow-game-sm focus-visible:outline focus-visible:outline-4 focus-visible:outline-brand-light`}
      />
      {isPassword && (
        <button
          type="button"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "Sembunyikan sandi" : "Tampilkan sandi"}
        >
          {show ? <IconEyeOff size={28} /> : <IconEye size={28} />}
        </button>
      )}
    </div>
  );
}
