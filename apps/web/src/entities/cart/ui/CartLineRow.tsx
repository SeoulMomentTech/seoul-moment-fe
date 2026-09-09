"use client";

import type { ReactNode } from "react";

import { XIcon } from "lucide-react";

import { useTranslations } from "next-intl";

import { cn } from "@shared/lib/style";
import { toNTCurrency } from "@shared/lib/utils";
import { BaseImage } from "@shared/ui/base-image";
import { Checkbox } from "@shared/ui/checkbox";
import { QuantityStepper } from "@shared/ui/quantity-stepper";

import { Link } from "@/i18n/navigation";

import { formatCartLineOptions } from "../lib/cartLineId";
import { getCartLineUnitPrice } from "../model/selectors";
import type { CartLine } from "../model/types";
import { MAX_LINE_QUANTITY } from "../model/useCartStore";

interface CartLineRowProps {
  line: CartLine;
  selected: boolean;
  onSelectedChange(selected: boolean): void;
  onQuantityChange(quantity: number): void;
  onRemove(): void;
  /** 이 라인에서 고를 수 있는 최대 수량. 재고를 반영한 값을 넘긴다 */
  maxQuantity?: number;
  /** 품절·판매중지. 수량과 선택을 잠그고 금액 합계에서 빠진다 */
  unavailable?: boolean;
  /** 재고가 얼마 안 남았을 때 그 개수. 넉넉하면 비워 둔다 */
  lowStock?: number;
  /** 라인 하단 우측에 붙는 액션. 외부 몰 구매 버튼 등. */
  actionSlot?: ReactNode;
  className?: string;
}

/**
 * 장바구니 한 줄. 썸네일 120px(모바일 100px) 으로 좋아요 목록의 80px 과 의도적으로 구분한다.
 * 옵션은 chip 이 아니라 `IVORY / M` 슬래시 표기 — 상품상세의 조합 라인과 같은 어휘를 쓴다.
 */
export function CartLineRow({
  line,
  selected,
  onSelectedChange,
  onQuantityChange,
  onRemove,
  maxQuantity = MAX_LINE_QUANTITY,
  unavailable = false,
  lowStock,
  actionSlot,
  className,
}: CartLineRowProps) {
  const t = useTranslations();
  const unitPrice = getCartLineUnitPrice(line);
  const hasDiscount = unitPrice < line.price;
  const optionText = formatCartLineOptions(line.options);

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
        aria-label={line.productName}
        checked={selected}
        // 살 수 없는 라인은 고를 수 없다 — 골라도 금액에 안 들어가 합계가 어긋나 보인다.
        disabled={unavailable}
        onChange={(event) => onSelectedChange(event.target.checked)}
      />

      <Link
        className="block w-full"
        href={`/product/${line.productId}`}
        tabIndex={-1}
      >
        {/* unoptimized — 코드베이스 관행이고(ProductCard/InterestProductRow 동일),
            장바구니는 imageUrl 을 스냅샷으로 들고 있어 호스트가 바뀌면
            next/image 가 던지며 페이지 전체를 죽인다. */}
        <BaseImage
          alt={line.productName}
          className="aspect-square w-full border border-black/[0.07] object-cover"
          height={240}
          src={line.imageUrl}
          unoptimized
          width={240}
        />
      </Link>

      <div className="min-w-0">
        <Link href={`/product/${line.productId}`}>
          <p
            className={cn(
              "text-body-2 mb-2 leading-snug tracking-[-0.01em]",
              "max-sm:text-body-3",
            )}
          >
            {line.productName}
          </p>
        </Link>

        {optionText && (
          <p className="text-body-5 text-neutral mb-2.5">{optionText}</p>
        )}

        {/* 품절이 우선이다. 둘 다 붙이면 "품절 · 2개 남음" 처럼 모순돼 보인다. */}
        {unavailable ? (
          <p className="text-body-5 mb-2.5 font-semibold text-black/70">
            {t("sold_out")}
          </p>
        ) : (
          lowStock != null && (
            <p className="text-body-5 text-brand mb-2.5 font-semibold tabular-nums">
              {t("stock_left", { stock: lowStock })}
            </p>
          )
        )}

        <div className="mb-3 flex items-baseline gap-2 tabular-nums">
          {hasDiscount && (
            <span className="text-body-4 text-black/40 line-through">
              {toNTCurrency(line.price)}
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

        <div className="flex flex-wrap items-center gap-3">
          <QuantityStepper
            disabled={unavailable}
            label={line.productName}
            max={maxQuantity}
            onChange={onQuantityChange}
            value={line.quantity}
          />
          {actionSlot}
        </div>
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
