"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { useUserAuthStore } from "@/shared/lib/hooks/useUserAuthStore";

import { cn } from "@seoul-moment/ui";

const style = "text-body-3 pt-[20px] pb-[20px]";

function LoginStatus() {
  const pathname = usePathname();
  const { isAuthenticated, logout } = useUserAuthStore();

  if (isAuthenticated) {
    return (
      <button className={style} onClick={logout} type="button">
        Logout
      </button>
    );
  }

  return (
    <Link
      className={cn(style, pathname === "/login" && "font-semibold")}
      href="/login"
      prefetch
    >
      Login
    </Link>
  );
}

export default LoginStatus;
