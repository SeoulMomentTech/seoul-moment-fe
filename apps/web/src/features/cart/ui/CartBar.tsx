"use client";

import { useRef } from "react";

import { useTranslations } from "next-intl";

import { useFloatingOffset } from "@shared/lib/hooks";
import { toNTCurrency } from "@shared/lib/utils";

import { Button } from "@seoul-moment/ui";

interface CartBarProps {
  selectedCount: number;
  amount: number;
}

/** 모바일 하단 고정 요약. 전역 결제 CTA 는 비활성 자리이고 실제 구매는 라인의 외부 몰 링크다. */
export function CartBar({ selectedCount, amount }: CartBarProps) {
  const t = useTranslations();
  const ref = useRef<HTMLDivElement>(null);

  // 챗봇 런처가 결제 CTA 를 덮지 않게 바 높이를 전역 오프셋으로 내보낸다.
  useFloatingOffset(ref);

  return (
    <div
      className="grid gap-3 border-t border-black/10 bg-white px-5 py-4"
      ref={ref}
    >
      <div className="flex items-baseline justify-between">
        <span className="text-body-3 text-neutral tabular-nums">
          {t("total_product_amount")} (
          {t("cart_selected_count", { count: selectedCount })})
        </span>
        <span className="text-body-1 font-bold tabular-nums tracking-[-0.02em]">
          {toNTCurrency(amount)}
        </span>
      </div>
      <Button
        aria-describedby="cart-bar-hint"
        className="h-12 w-full rounded-[4px]"
        disabled
        type="button"
      >
        {t("place_order")}
      </Button>
      <p className="text-body-5 text-neutral sr-only" id="cart-bar-hint">
        {t("coming_soon")}
      </p>
    </div>
  );
}
