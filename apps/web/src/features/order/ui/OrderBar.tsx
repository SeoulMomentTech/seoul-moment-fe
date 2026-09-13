"use client";

import { useRef } from "react";

import { useTranslations } from "next-intl";

import { useFloatingOffset } from "@shared/lib/hooks";
import { toNTCurrency } from "@shared/lib/utils";

import { Button } from "@seoul-moment/ui";

interface OrderBarProps {
  totalAmount: number;
}

/**
 * 모바일 하단 고정 결제 바. 금액 내역은 본문 섹션에 있고 여기는 합계와 CTA 만 둔다.
 */
export function OrderBar({ totalAmount }: OrderBarProps) {
  const t = useTranslations();
  const ref = useRef<HTMLDivElement>(null);

  // 챗봇 런처가 결제 CTA 를 덮지 않게 바 높이를 전역 오프셋으로 내보낸다(장바구니와 동일).
  useFloatingOffset(ref);

  return (
    <div
      className="grid gap-3 border-t border-black/10 bg-white px-5 py-4"
      ref={ref}
    >
      <div className="flex items-baseline justify-between">
        <span className="text-body-3 text-neutral">
          {t("final_payment_amount")}
        </span>
        <span className="text-body-1 font-bold tabular-nums tracking-[-0.02em]">
          {toNTCurrency(totalAmount)}
        </span>
      </div>
      <Button
        aria-describedby="order-bar-hint"
        className="h-12 w-full rounded-[4px]"
        disabled
        type="button"
      >
        {t("pay_now")}
      </Button>
      <p className="text-body-5 text-neutral sr-only" id="order-bar-hint">
        {t("coming_soon")}
      </p>
    </div>
  );
}
