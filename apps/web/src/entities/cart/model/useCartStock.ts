"use client";

import { useMemo } from "react";

import { useUserCartQuery } from "../api/useUserCart";

/**
 * `cartItemId` → 재고 수량.
 *
 * 로컬 라인은 담은 시점 스냅샷이라 재고를 들고 있지 않고, 들고 있어도 금방 낡는다. 재고는
 * 서버 장바구니(`GET user/cart`)가 매번 최신으로 내려주므로 그쪽을 본다 — 로컬 라인에
 * 붙여둔 `cartItemId` 가 두 세계를 잇는 열쇠다.
 *
 * 서버 담기에 실패해 `cartItemId` 가 없는 라인은 여기서 찾히지 않고, 그런 라인은
 * `getMaxLineQuantity` 가 정책 천장만 적용한다.
 */
export const useCartStock = (): ReadonlyMap<number, number> => {
  const { data } = useUserCartQuery();

  return useMemo(() => {
    const stock = new Map<number, number>();

    data?.brandGroups.forEach((group) =>
      group.items.forEach((item) =>
        stock.set(item.cartItemId, item.stockQuantity),
      ),
    );

    return stock;
  }, [data]);
};

/** 라인이 서버에 짝이 있으면 그 재고를, 없으면 `undefined` */
export const findLineStock = (
  stock: ReadonlyMap<number, number>,
  cartItemId?: number,
): number | undefined =>
  cartItemId == null ? undefined : stock.get(cartItemId);
