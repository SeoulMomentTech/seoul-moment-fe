"use client";

import { useTranslations } from "next-intl";

import { cn } from "@shared/lib/style";
import { toNTCurrency } from "@shared/lib/utils";
import { BaseImage } from "@shared/ui/base-image";

import { Link } from "@/i18n/navigation";

import {
  isCartItemUnavailable,
  type UserCartBrandGroup,
  type UserCartItem,
} from "@entities/cart";

function OrderLine({ item }: { item: UserCartItem }) {
  const t = useTranslations();

  return (
    <div
      className={cn(
        "grid grid-cols-[80px_minmax(0,1fr)_auto] items-start gap-3 py-3",
        isCartItemUnavailable(item) && "opacity-50",
      )}
    >
      <Link href={`/product/${item.productItemId}`} tabIndex={-1}>
        {/* unoptimized — 브랜드가 올린 외부 호스트 이미지다. 장바구니와 같은 이유로 맞춘다. */}
        <BaseImage
          alt={item.productName}
          className="aspect-square w-full border border-black/[0.07] object-cover"
          height={160}
          src={item.imageUrl}
          unoptimized
          width={160}
        />
      </Link>

      <div className="min-w-0">
        <Link href={`/product/${item.productItemId}`}>
          <p className="text-body-3 leading-snug tracking-[-0.01em]">
            {item.productName}
          </p>
        </Link>
        {item.optionText && (
          <p className="text-body-5 text-neutral mt-1.5">{item.optionText}</p>
        )}
        <p className="text-body-5 text-neutral mt-1.5 tabular-nums">
          {t("quantity")} {item.quantity}
        </p>
        {/* 장바구니에서는 고를 수 없는 라인이지만 URL 로 들어올 수 있다. 조용히 빼지 않고 알린다. */}
        {isCartItemUnavailable(item) && (
          <p className="text-body-5 mt-1.5 font-semibold text-black/70">
            {t("sold_out")}
          </p>
        )}
      </div>

      <span className="text-body-3 whitespace-nowrap text-right font-semibold tabular-nums">
        {toNTCurrency(item.totalPrice)}
      </span>
    </div>
  );
}

interface OrderItemListProps {
  groups: ReadonlyArray<UserCartBrandGroup>;
}

/**
 * 주문할 라인 목록. **읽기 전용**이다 — 수량 변경·삭제는 장바구니에서만 한다.
 * 주문서에서 고치게 하면 금액 재확정과 재고 검증이 한 화면에 얽힌다(시안 판단).
 *
 * 브랜드 묶음은 장바구니와 같은 표시 단위로만 남는다. 배송비는 브랜드가 아니라 주문 1건에
 * 붙으므로 그룹마다 소계·배송비를 달지 않는다.
 */
export function OrderItemList({ groups }: OrderItemListProps) {
  const t = useTranslations();

  return (
    <>
      {groups.map((group) => (
        <div
          className="border-b border-black/[0.06] pb-2 pt-1 last:border-b-0"
          key={group.brandId}
        >
          <div className="flex items-center gap-2 pb-1">
            {group.brandProfileImage && (
              <BaseImage
                alt=""
                className="size-6 shrink-0 rounded-full border border-black/[0.08] object-cover"
                height={48}
                src={group.brandProfileImage}
                unoptimized
                width={48}
              />
            )}
            <span className="text-body-3 font-semibold tracking-[-0.01em]">
              {group.brandName}
            </span>
          </div>

          {group.items.map((item) => (
            <OrderLine item={item} key={item.cartItemId} />
          ))}
        </div>
      ))}

      <p className="text-body-5 text-neutral mt-2 leading-relaxed">
        {t("order_single_shipping_fee_note")}
      </p>
    </>
  );
}
