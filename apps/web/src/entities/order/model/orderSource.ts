"use client";

import { useMemo } from "react";

import {
  createParser,
  parseAsArrayOf,
  parseAsInteger,
  useQueryState,
} from "nuqs";

import type {
  UserOrderDirectItem,
  UserOrderSourceBody,
} from "@shared/services/userOrder";

/**
 * 주문서가 무엇을 주문하는지. 장바구니에서 왔는지 상품상세 "구매하기" 로 왔는지로 갈린다.
 *
 * 서버는 두 경로에 서로 다른 본문(`cartItemIds` XOR `items`)을 요구하지만, 화면은 이 타입
 * 하나만 들고 다닌다 — 분기는 `toOrderSourceBody` 한 곳에만 있다.
 */
export type OrderSource =
  | { type: "cart"; cartItemIds: number[] }
  | { type: "direct"; items: UserOrderDirectItem[] };

/** 화면 타입 → 서버 요청 본문. 미리보기와 주문 생성이 같은 본문을 쓴다 */
export const toOrderSourceBody = (source: OrderSource): UserOrderSourceBody =>
  source.type === "cart"
    ? { cartItemIds: source.cartItemIds }
    : { items: source.items };

const isPositiveInt = (value: number) => Number.isInteger(value) && value > 0;

const serializeDirectItems = (items: ReadonlyArray<UserOrderDirectItem>) =>
  items
    .map(({ productVariantId, quantity }) => `${productVariantId}:${quantity}`)
    .join(",");

/**
 * `?buy=` 파서. `productVariantId:quantity` 쌍을 쉼표로 이은 값이다 (예: `101:1,102:2`).
 *
 * 한 쌍이라도 깨지면 전체를 버린다 — 성한 것만 골라 살리면 사용자가 고르지 않은 수량으로
 * 주문이 만들어진다. 양수 검증은 터무니없는 값이 서버까지 가는 걸 줄이는 용도이고,
 * 재고·판매 여부의 판정은 그대로 서버 몫이다.
 */
const parseAsDirectItems = createParser<UserOrderDirectItem[]>({
  parse: (query) => {
    const items = query.split(",").map((pair) => {
      const [productVariantId, quantity] = pair.split(":").map(Number);

      return { productVariantId, quantity };
    });

    return items.length > 0 &&
      items.every(
        ({ productVariantId, quantity }) =>
          isPositiveInt(productVariantId) && isPositiveInt(quantity),
      )
      ? items
      : null;
  },
  serialize: serializeDirectItems,
});

/**
 * 주문서 링크. 장바구니와 상품상세가 이 함수로만 주문서에 들어간다.
 *
 * 읽는 쪽(`useOrderSource`)과 같은 파일에서 만든다 — 링크를 손으로 짜면 파라미터
 * 이름이나 구분자가 갈라져도 컴파일은 통과하고, 런타임에 빈 주문서로만 드러난다.
 */
export const toOrderHref = (source: OrderSource): string =>
  source.type === "cart"
    ? `/order?cart=${source.cartItemIds.join(",")}`
    : `/order?buy=${serializeDirectItems(source.items)}`;

const parseAsCartItemIds = parseAsArrayOf(parseAsInteger).withDefault([]);

/**
 * 주문 대상을 URL 에서 읽는다.
 *
 * - `?cart=1,2,3` — 장바구니에서 고른 라인
 * - `?buy=101:1` — 상품상세 "구매하기"
 *
 * URL 은 신뢰 경계가 아니다. 소유자·재고·판매 여부는 서버가 다시 본다.
 */
export const useOrderSource = (): OrderSource | null => {
  const [cartItemIds] = useQueryState("cart", parseAsCartItemIds);
  // 예전 링크 호환. `?items=` 는 이름과 달리 cartItemId 목록이었다. 한 릴리스 뒤 지운다.
  const [legacyCartItemIds] = useQueryState("items", parseAsCartItemIds);
  const [items] = useQueryState("buy", parseAsDirectItems.withDefault([]));

  return useMemo(() => {
    const ids = cartItemIds.length > 0 ? cartItemIds : legacyCartItemIds;

    // 서버가 "둘 중 정확히 하나"를 요구한다. 손으로 고친 URL 에서 우리가 한쪽을 골라주면
    // 사용자가 의도하지 않은 물건이 주문되므로, 고르지 않고 무효로 본다.
    if (ids.length > 0 && items.length > 0) return null;
    if (items.length > 0) return { type: "direct", items };
    if (ids.length > 0) return { type: "cart", cartItemIds: ids };

    return null;
  }, [cartItemIds, legacyCartItemIds, items]);
};
