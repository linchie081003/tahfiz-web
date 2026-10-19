import { useLogout } from "../lib/auth";

type Props = {
  className?: string;
  label?: string;
};

export function LogoutButton({ className, label = "Keluar / Logout" }: Props) {
  const doLogout = useLogout();
  return (
    <button type="button" className={className} onClick={doLogout}>
      {label}
    </button>
  );
}
