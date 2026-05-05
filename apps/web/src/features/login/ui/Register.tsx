import { Link } from "@/i18n/navigation";

import { cn } from "@seoul-moment/ui";

export function Register() {
  return (
    <div
      className={cn(
        "mt-10 flex w-full justify-center gap-1 border-t border-t-black/10 pt-10",
        "max-md:mt-0 max-md:border-t-0 max-md:pt-[50px]",
      )}
    >
      <span>沒有 PChome 24h購物帳號？</span>
      <Link className="text-black/60" href="/signup">
        立即註冊
      </Link>
    </div>
  );
}
