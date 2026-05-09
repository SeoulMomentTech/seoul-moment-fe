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
      <span>이미 계정이 있으신가요?</span>
      <Link className="text-black/60 underline" href="/login">
        로그인
      </Link>
    </div>
  );
}
