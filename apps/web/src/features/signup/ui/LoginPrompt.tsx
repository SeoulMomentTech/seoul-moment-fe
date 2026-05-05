import { Link } from "@/i18n/navigation";

import { cn } from "@seoul-moment/ui";

export function LoginPrompt() {
  return (
    <div
      className={cn(
        "mt-10 flex w-full justify-center gap-1 border-t border-t-black/10 pt-10",
        "max-md:mt-0 max-md:border-t-0 max-md:pt-[50px]",
      )}
    >
      <span>已經擁有 PChome 24h購物帳號嗎？</span>
      <Link className="text-black/60 underline" href="/login">
        立即登入
      </Link>
    </div>
  );
}
