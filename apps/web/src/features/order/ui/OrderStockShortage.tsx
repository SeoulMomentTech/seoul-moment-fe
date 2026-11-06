"use client";

import { CircleAlert } from "lucide-react";

import { useTranslations } from "next-intl";

import { cn } from "@shared/lib/style";
import type { UserOrderPreviewBrandGroup } from "@shared/services/userOrder";

import { Link } from "@/i18n/navigation";

import type { OrderSource } from "@entities/order";

import type { StockShortage } from "../model/useOrderSubmit";

interface OrderStockShortageProps {
  shortage: StockShortage;
  groups: ReadonlyArray<UserOrderPreviewBrandGroup>;
  source: OrderSource;
  className?: string;
}

/**
 * 결제 시작 409 — 재고가 모자란 라인. 주문은 PENDING 으로 남지만 수량을 고쳐야 다시 결제할
 * 수 있으니 고칠 수 있는 곳으로 보낸다: 장바구니 주문은 장바구니, 바로 구매는 그 상품.
 */
export function OrderStockShortage({
  shortage,
  groups,
  source,
  className,
}: OrderStockShortageProps) {
  const t = useTranslations();

  const lines = groups
    .flatMap((group) => group.items)
    .filter((item) =>
      shortage.productVariantIds.includes(item.productVariantId),
    );

  const productItemId = lines[0]?.productItemId;
  const link =
    source.type === "cart"
      ? { href: "/cart", label: t("go_to_cart") }
      : productItemId
        ? {
            href: `/product/${productItemId}`,
            label: t("payment_go_to_product"),
          }
        : null;

  return (
    <div
      className={cn(
        "border-danger/40 bg-danger/5 text-body-4 grid gap-1 rounded-[4px] border p-4",
        className,
      )}
      role="alert"
    >
      <p className="text-danger flex items-center gap-1.5 font-semibold">
        <CircleAlert aria-hidden className="size-4 shrink-0" />
        {t("payment_stock_shortage_title")}
      </p>
      {lines.length > 0 && (
        <ul className="text-black/80">
          {lines.map((item) => (
            <li key={item.productVariantId}>
              {`${item.productName} (${item.optionText})`}
            </li>
          ))}
        </ul>
      )}
      <p className="text-neutral">{t("payment_stock_shortage_hint")}</p>
      {link && (
        <Link
          className="text-body-4 mt-1 w-fit font-semibold underline underline-offset-2"
          href={link.href}
        >
          {`${link.label} ›`}
        </Link>
      )}
    </div>
  );
}
