import type { PropsWithChildren } from "react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/shared/lib/style";

export default function ContactLayout({ children }: PropsWithChildren) {
  return (
    <section
      className={cn(
        "mx-auto w-[1280px] pt-[106px]",
        "flex gap-[20px] px-[20px]",
        "max-sm:w-full max-sm:flex-col max-sm:pt-[56px]",
        "max-sm:px-0",
      )}
    >
      <aside
        className={cn(
          "flex min-w-[305px] flex-col gap-[40px]",
          "max-sm:flex-row",
          "max-sm:border-b max-sm:border-b-black/10 max-sm:px-[20px]",
        )}
      >
        <h2 className="text-[28px] font-bold max-sm:hidden">Contact</h2>
        <div className="flex flex-col">
          <Link
            className={cn(
              "font-semibold",
              "max-sm:text-body-3 max-sm:border-b max-sm:border-b-black max-sm:pt-[10px] max-sm:pb-[16px]",
            )}
            href="/contact"
          >
            문의하기(일반&제휴)
          </Link>
        </div>
      </aside>
      <div className="px-0 max-sm:px-[20px]">{children}</div>
    </section>
  );
}
