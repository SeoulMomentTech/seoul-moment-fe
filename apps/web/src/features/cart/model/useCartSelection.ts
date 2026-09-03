"use client";

import { useCallback, useMemo, useState } from "react";

import type { CartLine } from "@entities/cart";

/**
 * 장바구니 선택 상태. URL 로 올리지 않는다 — 새로고침·공유로 보존할 가치가 없고
 * 라인 삭제와 동기화해야 하는 값이라 URL 에 두면 유령 id 가 남는다.
 *
 * 기본값은 **전체 선택**이다. 담아둔 것을 다시 보러 오는 화면이라 아무것도 선택 안 된 상태로
 * 시작하면 합계가 0으로 보이고 매번 전체 선택을 눌러야 한다.
 */
export const useCartSelection = (lines: ReadonlyArray<CartLine>) => {
  const [excluded, setExcluded] = useState<ReadonlySet<string>>(new Set());

  // 선택 해제된 id 만 들고 있는다. 새로 담긴 라인이 자동으로 선택 상태가 되고,
  // 삭제된 라인의 id 는 lines 에서 사라지므로 따로 정리할 필요가 없다.
  const selectedLineIds = useMemo(
    () =>
      new Set(
        lines
          .filter((line) => !excluded.has(line.lineId))
          .map((line) => line.lineId),
      ),
    [lines, excluded],
  );

  const toggle = useCallback((lineId: string, selected: boolean) => {
    setExcluded((prev) => {
      const next = new Set(prev);
      if (selected) next.delete(lineId);
      else next.add(lineId);
      return next;
    });
  }, []);

  const toggleMany = useCallback(
    (lineIds: ReadonlyArray<string>, selected: boolean) => {
      setExcluded((prev) => {
        const next = new Set(prev);
        for (const lineId of lineIds) {
          if (selected) next.delete(lineId);
          else next.add(lineId);
        }
        return next;
      });
    },
    [],
  );

  const selectedCount = selectedLineIds.size;
  const allSelected = lines.length > 0 && selectedCount === lines.length;
  const someSelected = selectedCount > 0 && !allSelected;

  return {
    selectedLineIds,
    selectedCount,
    allSelected,
    someSelected,
    isSelected: useCallback(
      (lineId: string) => selectedLineIds.has(lineId),
      [selectedLineIds],
    ),
    toggle,
    toggleMany,
    toggleAll: useCallback(
      (selected: boolean) =>
        toggleMany(
          lines.map((line) => line.lineId),
          selected,
        ),
      [lines, toggleMany],
    ),
  };
};
