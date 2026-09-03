"use client";

import { useTranslations } from "next-intl";

import { cn } from "@shared/lib/style";
import { toNTCurrency } from "@shared/lib/utils";

import { Button } from "@seoul-moment/ui";

interface CartSummaryProps {
  selectedCount: number;
  amount: number;
  className?: string;
}

/**
 * 결제 금액 요약. 배송비는 합계에 넣지 않는다 — `shippingCost` 는 상품 단위 값이라
 * 브랜드로 합산하면 부정확하다. "브랜드별 별도"로 정직하게 적는다.
 *
 * `주문하기` 는 비활성이다. 상품상세의 `구매하기` 와 같은 처리 — 마크업을 지금 만들어 두고
 * 결제가 붙을 때 UI 재작업이 없게 한다. 실제 구매는 라인의 외부 몰 링크가 담당한다.
 */
export function CartSummary({
  selectedCount,
  amount,
  className,
}: CartSummaryProps) {
  const t = useTranslations();

  return (
    <div className={cn("border border-black/20 p-6", className)}>
      <p className="text-body-3 text-neutral tabular-nums">
        {t("cart_selected_count", { count: selectedCount })}
      </p>
      <p className="text-body-3 mt-3.5">{t("total_product_amount")}</p>
      <p className="text-title-2 mt-0.5 font-bold tabular-nums tracking-[-0.03em]">
        {toNTCurrency(amount)}
      </p>

      <hr className="my-5 border-0 border-t border-black/10" />

      <div className="text-body-3 flex justify-between gap-4">
        <span>{t("shipping_fee")}</span>
        <span className="text-neutral">{t("cart_shipping_note")}</span>
      </div>

      <Button
        aria-describedby="cart-order-hint"
        className="mt-5 h-12 w-full rounded-[4px]"
        disabled
        type="button"
      >
        {t("place_order")}
      </Button>
      <p className="text-body-5 text-neutral mt-2" id="cart-order-hint">
        {t("coming_soon")}
      </p>

      <p className="text-body-5 text-neutral mt-3.5 leading-relaxed">
        {t("cart_price_snapshot_note")}
      </p>
    </div>
  );
}
