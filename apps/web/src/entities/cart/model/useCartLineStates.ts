"use client";

import { useMemo } from "react";

import { useUserCartQuery } from "../api/useUserCart";

/** 재고가 이보다 적으면 남은 개수를 알린다. 넉넉할 때 띄우면 노이즈이고 재고를 그대로 공개하는 셈이다 */
export const LOW_STOCK_THRESHOLD = 10;

/** 로컬 라인 하나에 대응하는 서버 쪽 사실 */
export interface CartLineServerState {
  stockQuantity: number;
  isSoldOut: boolean;
  /** 서버가 금액 합계에서 빼는 라인은 false. 품절 외의 사유(판매중지 등)도 포함한다 */
  isAvailable: boolean;
}

/**
 * `cartItemId` → 서버가 아는 그 라인의 상태.
 *
 * 로컬 라인은 담은 시점 스냅샷이라 재고·품절을 들고 있지 않고, 들고 있어도 금방 낡는다.
 * 서버 장바구니(`GET user/cart`)가 매번 최신으로 내려주므로 그쪽을 본다 — 로컬 라인에
 * 붙여둔 `cartItemId` 가 두 세계를 잇는 열쇠다.
 */
export const useCartLineStates = (): ReadonlyMap<
  number,
  CartLineServerState
> => {
  const { data } = useUserCartQuery();

  return useMemo(() => {
    const states = new Map<number, CartLineServerState>();

    data?.brandGroups.forEach((group) =>
      group.items.forEach((item) =>
        states.set(item.cartItemId, {
          stockQuantity: item.stockQuantity,
          isSoldOut: item.isSoldOut,
          isAvailable: item.isAvailable,
        }),
      ),
    );

    return states;
  }, [data]);
};

/** 라인이 서버에 짝이 있으면 그 상태를, 없으면 `undefined` */
export const findCartLineState = (
  states: ReadonlyMap<number, CartLineServerState>,
  cartItemId?: number,
): CartLineServerState | undefined =>
  cartItemId == null ? undefined : states.get(cartItemId);

/**
 * 살 수 없는 라인인지.
 *
 * 서버에 짝이 없으면(담기 실패로 `cartItemId` 가 없거나 아직 응답 전) **막지 않는다** —
 * 모른다는 이유로 품절 처리하면 멀쩡한 라인이 회색이 된다.
 */
export const isCartLineUnavailable = (state?: CartLineServerState): boolean =>
  state ? state.isSoldOut || !state.isAvailable : false;

/** 남은 개수를 알릴 만큼 재고가 적은지. 품절은 별도 표기라 제외한다 */
export const isCartLineLowStock = (state?: CartLineServerState): boolean =>
  state != null &&
  !isCartLineUnavailable(state) &&
  state.stockQuantity > 0 &&
  state.stockQuantity < LOW_STOCK_THRESHOLD;
