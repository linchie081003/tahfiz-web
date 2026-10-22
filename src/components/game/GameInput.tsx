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
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-brand">
          <IconMail size={22} decorative />
        </span>
      )}
      <input
        {...rest}
        type={inputType}
        className={`h-[52px] w-full rounded-pill border-0 bg-brand-light ${leftIcon === "mail" ? "pl-12" : "pl-5"} ${isPassword ? "pr-14" : "pr-5"} text-base font-semibold text-outline placeholder:text-muted/70`}
      />
      {isPassword && (
        <button
          type="button"
          className="absolute right-1 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-muted"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "Sembunyikan sandi" : "Tampilkan sandi"}
        >
          {show ? <IconEyeOff size={26} /> : <IconEye size={26} />}
        </button>
      )}
    </div>
  );
}
