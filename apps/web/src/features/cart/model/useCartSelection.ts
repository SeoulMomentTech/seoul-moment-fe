"use client";

import { useCallback, useMemo, useState } from "react";

import type { UserCartItem } from "@entities/cart";

/**
 * 장바구니 선택 상태. URL 로 올리지 않는다 — 새로고침·공유로 보존할 가치가 없고
 * 라인 삭제와 동기화해야 하는 값이라 URL 에 두면 유령 id 가 남는다.
 *
 * 기본값은 **전체 선택**이다. 담아둔 것을 다시 보러 오는 화면이라 아무것도 선택 안 된 상태로
 * 시작하면 합계가 0으로 보이고 매번 전체 선택을 눌러야 한다.
 *
 * `unselectableIds`(품절·판매중지)는 선택 자체에서 빠진다. 고를 수 있게 두면 합계에는
 * 안 들어가는데 개수에만 잡혀 "3개 선택"과 금액이 어긋나 보이고, 전체 선택이 영원히
 * 완료되지 않는다.
 */
export const useCartSelection = (
  items: ReadonlyArray<UserCartItem>,
  unselectableIds?: ReadonlySet<number>,
) => {
  const [excluded, setExcluded] = useState<ReadonlySet<number>>(new Set());

  const selectableItems = useMemo(
    () => items.filter((item) => !unselectableIds?.has(item.cartItemId)),
    [items, unselectableIds],
  );

  // 선택 해제된 id 만 들고 있는다. 새로 담긴 라인이 자동으로 선택 상태가 되고,
  // 삭제된 라인의 id 는 items 에서 사라지므로 따로 정리할 필요가 없다.
  const selectedCartItemIds = useMemo(
    () =>
      new Set(
        selectableItems
          .filter((item) => !excluded.has(item.cartItemId))
          .map((item) => item.cartItemId),
      ),
    [selectableItems, excluded],
  );

  const toggle = useCallback((cartItemId: number, selected: boolean) => {
    setExcluded((prev) => {
      const next = new Set(prev);
      if (selected) next.delete(cartItemId);
      else next.add(cartItemId);
      return next;
    });
  }, []);

  const toggleMany = useCallback(
    (cartItemIds: ReadonlyArray<number>, selected: boolean) => {
      setExcluded((prev) => {
        const next = new Set(prev);
        for (const cartItemId of cartItemIds) {
          if (selected) next.delete(cartItemId);
          else next.add(cartItemId);
        }
        return next;
      });
    },
    [],
  );

  const selectedCount = selectedCartItemIds.size;
  const allSelected =
    selectableItems.length > 0 && selectedCount === selectableItems.length;
  const someSelected = selectedCount > 0 && !allSelected;

  return {
    selectedCartItemIds,
    selectedCount,
    /** 전체 선택 기준이 되는 개수 — 품절 라인은 빠진다 */
    selectableCount: selectableItems.length,
    allSelected,
    someSelected,
    isSelected: useCallback(
      (cartItemId: number) => selectedCartItemIds.has(cartItemId),
      [selectedCartItemIds],
    ),
    toggle,
    toggleMany,
    toggleAll: useCallback(
      (selected: boolean) =>
        toggleMany(
          selectableItems.map((item) => item.cartItemId),
          selected,
        ),
      [selectableItems, toggleMany],
    ),
  };
};
