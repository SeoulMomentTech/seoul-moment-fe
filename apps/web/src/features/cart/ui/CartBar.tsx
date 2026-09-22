"use client";

import { useRef } from "react";

import { useTranslations } from "next-intl";

import { useFloatingOffset } from "@shared/lib/hooks";
import { toNTCurrency } from "@shared/lib/utils";

import { Link } from "@/i18n/navigation";

import type { CartOrderCta } from "@entities/cart";
import { Button } from "@seoul-moment/ui";

import type { CartSummaryValues } from "./CartSummary";

interface CartBarProps extends CartSummaryValues {
  /** `주문하기` 버튼이 무엇을 해야 하는지. `CartSummary` 와 같은 판정을 공유한다 */
  orderCta: CartOrderCta;
  /** `orderCta.type === "guest"` 일 때 버튼을 누르면 호출된다. 토스트는 호출부(`CartList`)가 띄운다 */
  onGuestOrderAttempt(): void;
}

/** 모바일 하단 고정 요약. 데스크톱 패널과 같은 값을 쓰고 CTA 만 압축해 보여준다. */
export function CartBar({
  selectedCount,
  shippingFee,
  totalAmount,
  orderCta,
  onGuestOrderAttempt,
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
      {orderCta.type === "link" ? (
        <Button asChild className="h-12 w-full rounded-[4px]">
          <Link
            className="flex h-full w-full items-center justify-center"
            href={orderCta.href}
          >
            {t("place_order")}
          </Link>
        </Button>
      ) : orderCta.type === "guest" ? (
        <Button
          className="h-12 w-full rounded-[4px]"
          onClick={onGuestOrderAttempt}
          type="button"
        >
          {t("place_order")}
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
