"use client";

import { useId, useMemo } from "react";

import { toNTCurrency } from "@shared/lib/utils";
import { BaseImage } from "@shared/ui/base-image";
import { Checkbox } from "@shared/ui/checkbox";

import {
  CartLineRow,
  isCartItemUnavailable,
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

  // 품절·판매중지 라인은 애초에 고를 수 없다(`useCartSelection`). 세는 쪽에서 함께 빼지
  // 않으면 그 라인이 낀 브랜드는 전체 선택이 영원히 완료되지 않아 체크박스가 중간 상태로 굳는다.
  const selectableIds = group.items
    .filter((item) => !isCartItemUnavailable(item))
    .map((item) => item.cartItemId);
  const selectedInGroup = selectableIds.filter((id) =>
    selectedCartItemIds.has(id),
  ).length;
  const allSelected =
    selectableIds.length > 0 && selectedInGroup === selectableIds.length;

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
          // 전부 품절인 브랜드는 누를 대상이 없다. 켜지지도 않는 체크박스를 살려두지 않는다.
          disabled={selectableIds.length === 0}
          indeterminate={selectedInGroup > 0 && !allSelected}
          onChange={(event) =>
            onToggleGroup(selectableIds, event.target.checked)
          }
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
