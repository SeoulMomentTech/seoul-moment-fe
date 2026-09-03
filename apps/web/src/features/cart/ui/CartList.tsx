"use client";

import { useCallback, useMemo, useRef } from "react";

import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { cn } from "@shared/lib/style";
import FixedBox from "@shared/ui/fixed-box";

import {
  groupCartLinesByBrand,
  sumCartAmount,
  useCart,
  type CartLine,
} from "@entities/cart";

import { CartBar } from "./CartBar";
import { CartBrandGroupSection } from "./CartBrandGroup";
import { CartEmpty } from "./CartEmpty";
import { CartSelectionBar } from "./CartSelectionBar";
import { CartSummary } from "./CartSummary";
import { useCartSelection } from "../model/useCartSelection";

export function CartList() {
  const t = useTranslations();
  const { lines, updateQuantity, removeLines, restoreLines } = useCart();
  const selection = useCartSelection(lines);

  // 되돌리기용 스냅샷. 토스트 액션이 실행될 시점에는 스토어에서 이미 사라졌으므로 따로 들고 있는다.
  const removedRef = useRef<CartLine[]>([]);

  const handleRemove = useCallback(
    (lineIds: ReadonlyArray<string>) => {
      if (!lineIds.length) return;

      const ids = new Set(lineIds);
      removedRef.current = lines.filter((line) => ids.has(line.lineId));
      removeLines(lineIds);

      const snapshot = removedRef.current;
      toast(t("removed_from_cart"), {
        action: {
          label: t("undo"),
          onClick: () => restoreLines(snapshot),
        },
      });
    },
    [lines, removeLines, restoreLines, t],
  );

  const groups = useMemo(
    () => groupCartLinesByBrand(lines, selection.selectedLineIds),
    [lines, selection.selectedLineIds],
  );

  const amount = useMemo(
    () => sumCartAmount(lines, selection.selectedLineIds),
    [lines, selection.selectedLineIds],
  );

  if (!lines.length) return <CartEmpty />;

  return (
    <>
      <CartSelectionBar
        allSelected={selection.allSelected}
        onDeleteAll={() => handleRemove(lines.map((line) => line.lineId))}
        onDeleteSelected={() => handleRemove([...selection.selectedLineIds])}
        onToggleAll={selection.toggleAll}
        selectedCount={selection.selectedCount}
        someSelected={selection.someSelected}
        totalCount={lines.length}
      />

      <div
        className={cn(
          "grid grid-cols-[minmax(0,1fr)_360px] items-start gap-10 pt-1",
          "max-lg:grid-cols-1 max-lg:gap-8",
        )}
      >
        <div>
          {groups.map((group) => (
            <CartBrandGroupSection
              group={group}
              isSelected={selection.isSelected}
              key={group.brandId}
              onQuantityChange={updateQuantity}
              onRemove={(lineId) => handleRemove([lineId])}
              onToggleGroup={selection.toggleMany}
              onToggleLine={selection.toggle}
            />
          ))}
        </div>

        <CartSummary
          amount={amount}
          className="top-19 sticky max-sm:hidden"
          selectedCount={selection.selectedCount}
        />
      </div>

      {/* 모바일에서는 sticky 패널 대신 하단 고정 바 */}
      <FixedBox className="left-0 z-10 hidden max-sm:block" direction="bottom">
        <CartBar amount={amount} selectedCount={selection.selectedCount} />
      </FixedBox>
    </>
  );
}
