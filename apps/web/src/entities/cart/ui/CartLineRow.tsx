"use client";

import { XIcon } from "lucide-react";

import { useTranslations } from "next-intl";

import { cn } from "@shared/lib/style";
import { toNTCurrency } from "@shared/lib/utils";
import { BaseImage } from "@shared/ui/base-image";
import { Checkbox } from "@shared/ui/checkbox";
import { QuantityStepper } from "@shared/ui/quantity-stepper";

import { Link } from "@/i18n/navigation";

import { getMaxLineQuantity } from "../model/cartPolicy";
import {
  getCartItemUnitPrice,
  isCartItemLowStock,
  isCartItemUnavailable,
} from "../model/cartSelectors";
import type { UserCartItem } from "../model/types";

interface CartLineRowProps {
  item: UserCartItem;
  selected: boolean;
  onSelectedChange(selected: boolean): void;
  onQuantityChange(quantity: number): void;
  onRemove(): void;
  className?: string;
}

/**
 * 장바구니 한 줄. 썸네일 120px(모바일 100px) 으로 좋아요 목록의 80px 과 의도적으로 구분한다.
 * 옵션은 chip 이 아니라 `IVORY / M` 슬래시 표기 — 서버가 그 형태로 내려준다.
 *
 * 재고·품절·수량 상한은 모두 라인 자신이 들고 있으므로 호출부가 따로 계산해 넘기지 않는다.
 */
export function CartLineRow({
  item,
  selected,
  onSelectedChange,
  onQuantityChange,
  onRemove,
  className,
}: CartLineRowProps) {
  const t = useTranslations();
  const unitPrice = getCartItemUnitPrice(item);
  const hasDiscount = unitPrice < item.price;
  const unavailable = isCartItemUnavailable(item);
  const lowStock = isCartItemLowStock(item);

  return (
    <div
      className={cn(
        "grid grid-cols-[20px_120px_minmax(0,1fr)_32px] items-start gap-4 border-b border-black/[0.06] py-5",
        "max-sm:py-4.5 max-sm:grid-cols-[20px_100px_minmax(0,1fr)_28px] max-sm:gap-3",
        (!selected || unavailable) && "opacity-50",
        className,
      )}
    >
      <Checkbox
        aria-label={item.productName}
        checked={selected}
        // 살 수 없는 라인은 고를 수 없다 — 골라도 금액에 안 들어가 합계가 어긋나 보인다.
        disabled={unavailable}
        onChange={(event) => onSelectedChange(event.target.checked)}
      />

      <Link
        className="block w-full"
        href={`/product/${item.productItemId}`}
        tabIndex={-1}
      >
        {/* unoptimized — 코드베이스 관행이고(ProductCard/InterestProductRow 동일),
            브랜드가 올린 외부 호스트 이미지라 호스트가 바뀌면 next/image 가 던지며
            페이지 전체를 죽인다. */}
        <BaseImage
          alt={item.productName}
          className="aspect-square w-full border border-black/[0.07] object-cover"
          height={240}
          src={item.imageUrl}
          unoptimized
          width={240}
        />
      </Link>

      <div className="min-w-0">
        <Link href={`/product/${item.productItemId}`}>
          <p
            className={cn(
              "text-body-2 mb-2 leading-snug tracking-[-0.01em]",
              "max-sm:text-body-3",
            )}
          >
            {item.productName}
          </p>
        </Link>

        {item.optionText && (
          <p className="text-body-5 text-neutral mb-2.5">{item.optionText}</p>
        )}

        {/* 품절이 우선이다. 둘 다 붙이면 "품절 · 2개 남음" 처럼 모순돼 보인다. */}
        {unavailable ? (
          <p className="text-body-5 mb-2.5 font-semibold text-black/70">
            {t("sold_out")}
          </p>
        ) : (
          lowStock && (
            <p className="text-body-5 text-brand mb-2.5 font-semibold tabular-nums">
              {t("stock_left", { stock: item.stockQuantity })}
            </p>
          )
        )}

        <div className="mb-3 flex items-baseline gap-2 tabular-nums">
          {hasDiscount && (
            <span className="text-body-4 text-black/40 line-through">
              {toNTCurrency(item.price)}
            </span>
          )}
          <span
            className={cn(
              "text-body-1 font-semibold tracking-[-0.01em]",
              "max-sm:text-body-2",
            )}
          >
            {toNTCurrency(unitPrice)}
          </span>
        </div>

        <QuantityStepper
          disabled={unavailable}
          label={item.productName}
          max={getMaxLineQuantity(item.stockQuantity)}
          onChange={onQuantityChange}
          value={item.quantity}
        />
      </div>

      <button
        aria-label={t("remove_from_cart")}
        className="text-neutral -mr-1.5 -mt-1 grid size-8 cursor-pointer place-items-center"
        onClick={onRemove}
        type="button"
      >
        <XIcon height={17} width={17} />
      </button>
    </div>
  );
}
