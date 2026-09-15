"use client";

import { useMemo } from "react";

import { parseAsArrayOf, parseAsInteger, useQueryState } from "nuqs";

import {
  listCartItems,
  sumSelectedAmount,
  useCart,
  type UserCartBrandGroup,
} from "@entities/cart";

/**
 * 주문할 라인. 장바구니에서 고른 `cartItemId` 목록을 URL 로 받는다.
 *
 * 목록 자체는 장바구니 쿼리를 그대로 읽는다 — 주문서가 자기 사본을 들면 수량·품절이
 * 장바구니와 어긋날 수 있고, 어느 쪽이 옳은지 화면에서 알 수 없어진다. URL 의 id 는
 * 사용자가 고칠 수 있지만 서버가 소유자와 유효성을 다시 보므로 신뢰 경계가 아니다.
 */
export const useOrderItems = () => {
  const [itemIds] = useQueryState(
    "items",
    parseAsArrayOf(parseAsInteger).withDefault([]),
  );

  const { brandGroups, isPending, isError, refetch } = useCart();

  const selectedIds = useMemo(() => new Set(itemIds), [itemIds]);

  // 브랜드 묶음은 유지하고 고르지 않은 라인만 걷어낸다. 라인이 하나도 남지 않은
  // 브랜드는 머리글만 떠 있게 되므로 묶음째 제외한다.
  const groups = useMemo<UserCartBrandGroup[]>(
    () =>
      brandGroups
        .map((group) => ({
          ...group,
          items: group.items.filter((item) => selectedIds.has(item.cartItemId)),
        }))
        .filter((group) => group.items.length > 0),
    [brandGroups, selectedIds],
  );

  const items = useMemo(() => listCartItems(groups), [groups]);

  return {
    cartItemIds: items.map((item) => item.cartItemId),
    groups,
    items,
    /** 미리보기를 부르기 전까지 화면에 쓸 상품 금액. 장바구니와 같은 계산이다 */
    productAmount: sumSelectedAmount(items, selectedIds),
    isPending,
    isError,
    refetch,
    /** URL 에 id 가 아예 없는 경우. 장바구니를 거치지 않고 들어온 상태다 */
    hasNoSelection: itemIds.length === 0,
  };
};
