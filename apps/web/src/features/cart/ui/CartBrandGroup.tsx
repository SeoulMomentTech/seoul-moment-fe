"use client";

import { useId } from "react";

import { toNTCurrency } from "@shared/lib/utils";
import { BaseImage } from "@shared/ui/base-image";
import { Checkbox } from "@shared/ui/checkbox";

import { CartLineRow, type CartBrandGroup as Group } from "@entities/cart";

import { CartLinePurchase } from "./CartLinePurchase";

interface CartBrandGroupProps {
  group: Group;
  isSelected(lineId: string): boolean;
  onToggleLine(lineId: string, selected: boolean): void;
  onToggleGroup(lineIds: ReadonlyArray<string>, selected: boolean): void;
  onQuantityChange(lineId: string, quantity: number): void;
  onRemove(lineId: string): void;
}

/**
 * 브랜드 단위 그룹. 좋아요 목록이 플랫 리스트인 것과 달리 장바구니는 브랜드로 묶인다 —
 * 실제 구매도 브랜드/외부 몰 단위로 갈리고, 브랜드명을 라인마다 반복하지 않아 라인이 조용해진다.
 */
export function CartBrandGroupSection({
  group,
  isSelected,
  onToggleLine,
  onToggleGroup,
  onQuantityChange,
  onRemove,
}: CartBrandGroupProps) {
  const titleId = useId();
  const lineIds = group.lines.map((line) => line.lineId);
  const selectedInGroup = lineIds.filter(isSelected).length;
  const allSelected = selectedInGroup === lineIds.length;

  return (
    <section aria-labelledby={titleId} className="pt-7">
      <div className="flex items-center gap-2.5 border-b border-black/10 pb-3">
        <Checkbox
          aria-label={group.brandName}
          checked={allSelected}
          indeterminate={selectedInGroup > 0 && !allSelected}
          onChange={(event) => onToggleGroup(lineIds, event.target.checked)}
        />
        {group.brandProfileImg && (
          <BaseImage
            alt=""
            className="size-7 shrink-0 rounded-full border border-black/[0.08] object-cover"
            height={56}
            src={group.brandProfileImg}
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
          {toNTCurrency(group.selectedAmount)}
        </span>
      </div>

      {group.lines.map((line) => (
        <CartLineRow
          actionSlot={<CartLinePurchase external={line.external} />}
          key={line.lineId}
          line={line}
          onQuantityChange={(quantity) =>
            onQuantityChange(line.lineId, quantity)
          }
          onRemove={() => onRemove(line.lineId)}
          onSelectedChange={(selected) => onToggleLine(line.lineId, selected)}
          selected={isSelected(line.lineId)}
        />
      ))}
    </section>
  );
}
