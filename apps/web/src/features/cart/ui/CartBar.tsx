"use client";

import { useRef } from "react";

import { useTranslations } from "next-intl";

import { useFloatingOffset } from "@shared/lib/hooks";
import { toNTCurrency } from "@shared/lib/utils";

import { Link } from "@/i18n/navigation";

import { Button } from "@seoul-moment/ui";

import type { CartSummaryValues } from "./CartSummary";

interface CartBarProps extends CartSummaryValues {
  /** 주문서로 갈 링크. 고른 라인이 없으면 `null` 이고 버튼은 비활성이다 */
  orderHref: string | null;
}

/** 모바일 하단 고정 요약. 데스크톱 패널과 같은 값을 쓰고 CTA 만 압축해 보여준다. */
export function CartBar({
  selectedCount,
  shippingFee,
  totalAmount,
  orderHref,
}: CartBarProps) {
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
          {t("estimated_total_amount")} (
          {t("cart_selected_count", { count: selectedCount })})
        </span>
        <span className="text-body-1 font-bold tabular-nums tracking-[-0.02em]">
          {toNTCurrency(totalAmount)}
        </span>
      </div>
      <p className="text-body-5 text-neutral -mt-1.5 tabular-nums">
        {t("cart_shipping_fee_estimate")}{" "}
        {shippingFee > 0 ? toNTCurrency(shippingFee) : t("free_shipping")}
      </p>
      {orderHref ? (
        <Button asChild className="h-12 w-full rounded-[4px]">
          <Link
            className="flex h-full w-full items-center justify-center"
            href={orderHref}
          >
            {t("place_order")}
          </Link>
        </Button>
      ) : (
        <>
          <Button
            aria-describedby="cart-bar-hint"
            className="h-12 w-full rounded-[4px]"
            disabled
            type="button"
          >
            {t("place_order")}
          </Button>
          <p className="text-body-5 text-neutral sr-only" id="cart-bar-hint">
            {t("select_items_to_order")}
          </p>
        </>
      )}
    </div>
  );
}
