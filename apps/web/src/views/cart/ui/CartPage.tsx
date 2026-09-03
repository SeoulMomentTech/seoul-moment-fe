"use client";

import { useTranslations } from "next-intl";

import AuthOnly from "@shared/lib/components/AuthOnly";
import { cn } from "@shared/lib/style";

import { useCart } from "@entities/cart";
import { CartList } from "@features/cart";
import { Skeleton } from "@seoul-moment/ui";

function CartSkeleton() {
  return (
    <div className="pt-4">
      <Skeleton className="h-12 w-full" />
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          className="flex gap-4 border-b border-black/[0.06] py-5"
          key={`cart-skeleton-${index + 1}`}
        >
          <Skeleton className="size-30 max-sm:size-25 shrink-0" />
          <div className="flex flex-1 flex-col gap-3">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-5 w-24" />
            <Skeleton className="w-22 h-8" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function CartPage() {
  const t = useTranslations();
  const { lineCount, isHydrated } = useCart();

  return (
    <AuthOnly>
      <div
        className={cn(
          // 헤더가 fixed h-56 이라 그보다 큰 상단 패딩이 필요하다 (ProductDetailPage 관행)
          "pt-26.5 pb-15 mx-auto w-full max-w-7xl px-5",
          "max-sm:pb-30 max-sm:pt-19",
        )}
      >
        <div className="mb-5 flex items-baseline gap-2.5">
          <h1 className="text-title-3 max-sm:text-title-4 font-bold tracking-[-0.02em]">
            {t("cart")}
          </h1>
          {isHydrated && lineCount > 0 && (
            <span className="text-title-4 text-brand max-sm:text-body-1 font-bold tabular-nums">
              {lineCount}
            </span>
          )}
        </div>

        {/* persist rehydrate 전에는 담긴 것을 알 수 없다. 빈 화면을 먼저 보여주면
            새로고침마다 "비어 있습니다"가 깜박인다. */}
        {isHydrated ? <CartList /> : <CartSkeleton />}
      </div>
    </AuthOnly>
  );
}
