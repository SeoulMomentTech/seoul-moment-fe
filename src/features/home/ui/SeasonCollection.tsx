import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { cn } from "@/shared/lib/style";

export function SeasonCollection() {
  return (
    <section
      className={cn(
        "mx-auto flex w-[1280px] justify-between py-[140px]",
        "max-sm:w-auto max-sm:flex-col-reverse max-sm:gap-[40px] max-sm:px-[20px] max-sm:py-[90px]",
      )}
    >
      <div
        className={cn(
          "flex flex-col justify-center gap-[90px]",
          "max-sm:ml-0 max-sm:gap-[30px]",
        )}
      >
        <div className="flex flex-col gap-[20px]">
          <h3 className={cn("text-[32px] font-semibold", "max-sm:text-[20px]")}>
            2025 S/S Vibes of Seoul
          </h3>
          <span className="max-sm:text-[14px]">
            새로운 2025 S/S 상품으로 실용적인 제품을 만나보세요.
          </span>
        </div>
        <Link
          className={cn("flex items-center text-[14px]", "max-sm:text-[13px]")}
          href="/product"
        >
          <div className="inline-flex gap-[4px] border-b">
            Product detail
            <ArrowRightIcon height={16} width={16} />
          </div>
        </Link>
      </div>
      <div
        className={cn(
          "flex h-[590px] gap-[30px]",
          "max-sm:h-[199px] max-sm:gap-[16px]",
        )}
      >
        <div
          className={cn("w-[354px] bg-gray-300", "max-sm:w-auto max-sm:flex-1")}
        />
        <div
          className={cn("w-[354px] bg-gray-300", "max-sm:w-auto max-sm:flex-1")}
        />
      </div>
    </section>
  );
}
