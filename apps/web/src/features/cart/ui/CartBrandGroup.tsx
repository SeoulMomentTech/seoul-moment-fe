"use client";

import { useId, useMemo } from "react";

import { toNTCurrency } from "@shared/lib/utils";
import { BaseImage } from "@shared/ui/base-image";
import { Checkbox } from "@shared/ui/checkbox";

import {
  CartLineRow,
  sumSelectedAmount,
  type UserCartBrandGroup,
} from "@entities/cart";

interface CartBrandGroupProps {
  group: UserCartBrandGroup;
  selectedCartItemIds: ReadonlySet<number>;
  onToggleLine(cartItemId: number, selected: boolean): void;
  onToggleGroup(cartItemIds: ReadonlyArray<number>, selected: boolean): void;
  onQuantityChange(cartItemId: number, quantity: number): void;
  onRemove(cartItemId: number): void;
}

/**
 * 브랜드 단위 그룹. 좋아요 목록이 플랫 리스트인 것과 달리 장바구니는 브랜드로 묶인다 —
 * 브랜드명을 라인마다 반복하지 않아 라인이 조용해지고, 묶음과 순서는 서버가 정해 준다.
 *
 * 소계는 서버의 `productAmount`(전체 기준)가 아니라 **선택된 라인만** 더한 값이다.
 */
export function CartBrandGroupSection({
  group,
  selectedCartItemIds,
  onToggleLine,
  onToggleGroup,
  onQuantityChange,
  onRemove,
}: CartBrandGroupProps) {
  const titleId = useId();
  const cartItemIds = group.items.map((item) => item.cartItemId);
  const selectedInGroup = cartItemIds.filter((id) =>
    selectedCartItemIds.has(id),
  ).length;
  const allSelected = selectedInGroup === cartItemIds.length;

  const selectedAmount = useMemo(
    () => sumSelectedAmount(group.items, selectedCartItemIds),
    [group.items, selectedCartItemIds],
  );

  return (
    <section aria-labelledby={titleId} className="pt-7">
      <div className="flex items-center gap-2.5 border-b border-black/10 pb-3">
        <Checkbox
          aria-label={group.brandName}
          checked={allSelected}
          indeterminate={selectedInGroup > 0 && !allSelected}
          onChange={(event) => onToggleGroup(cartItemIds, event.target.checked)}
        />
        {group.brandProfileImage && (
          <BaseImage
            alt=""
            className="size-7 shrink-0 rounded-full border border-black/[0.08] object-cover"
            height={56}
            src={group.brandProfileImage}
            unoptimized
            width={56}
          />
        )}
        <span
          className="text-body-2 max-sm:text-body-3 font-semibold tracking-[-0.01em]"
          id={titleId}
        >
          {group.brandName}
        </span>
        <span className="text-body-3 ml-auto font-semibold tabular-nums">
          {toNTCurrency(selectedAmount)}
        </span>
      </div>

      {group.items.map((item) => (
        <CartLineRow
          item={item}
          key={item.cartItemId}
          onQuantityChange={(quantity) =>
            onQuantityChange(item.cartItemId, quantity)
          }
          onRemove={() => onRemove(item.cartItemId)}
          onSelectedChange={(selected) =>
            onToggleLine(item.cartItemId, selected)
          }
          selected={selectedCartItemIds.has(item.cartItemId)}
        />
      ))}
    </section>
  );
}
