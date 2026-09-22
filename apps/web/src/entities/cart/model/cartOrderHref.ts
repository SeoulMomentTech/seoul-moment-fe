"use client";

// 이 파일 자체에는 훅이 없지만 "use client" 가 필요하다 — `@entities/order` 를 거쳐
// 클라이언트 전용 코드(`useOrderPreviewQuery` 등)를 끌어오므로, 이 모듈이 서버 컴포넌트
// 그래프(entities/cart 배럴 → app/[locale]/layout.tsx)에서 계속 닿을 수 있다. 지우지 말 것.

import { toOrderHref } from "@entities/order";

import type { CartSource } from "./cartSource";
import type { CartLine } from "./types";

interface ToCartOrderCtaArgs {
  source: CartSource | null;
  lines: ReadonlyArray<CartLine>;
  selectedVariantIds: ReadonlySet<number>;
}

/**
 * 장바구니의 `주문하기` 버튼이 무엇을 해야 하는지.
 *
 * 주문·결제는 회원 전용이다(서버가 게스트 주문을 지원하지 않는다). 세 갈래로 갈린다 —
 * `entities/order/model/orderSource.ts` 의 `OrderSource` 와 같은 어휘(판별 유니온)를 쓴다.
 *
 * - `link` — 회원이고 고른 라인 전부가 `cartItemId` 를 가진다. 주문서로 이동한다.
 * - `guest` — 게스트이고 하나 이상 골랐다. 버튼은 활성이지만 누르면 로그인이 필요하다는
 *   토스트만 뜨고 이동하지 않는다 — 게스트 라인은 `cartItemId` 가 없어 주문서가 애초에
 *   받을 수 없다. 요청하지 않은 로그인 화면으로 보내는 것은 이 거절에 비해 과한
 *   인터럽트다.
 * - `disabled` — 고른 것이 없거나, 아직 어느 카트인지 모르거나(source 미정), 회원인데
 *   고른 라인 중 하나라도 `cartItemId` 가 없을 때. 버튼을 막고 안내 문구를 보여준다.
 */
export type CartOrderCta =
  | { type: "link"; href: string }
  | { type: "guest" }
  | { type: "disabled" };

export const toCartOrderCta = ({
  source,
  lines,
  selectedVariantIds,
}: ToCartOrderCtaArgs): CartOrderCta => {
  if (!source || selectedVariantIds.size === 0) return { type: "disabled" };

  if (source.kind === "guest") return { type: "guest" };

  const selected = lines.filter((line) =>
    selectedVariantIds.has(line.productVariantId),
  );

  const cartItemIds = selected
    .map((line) => line.cartItemId)
    .filter((cartItemId): cartItemId is number => cartItemId != null);

  // 고른 라인 중 하나라도 서버 id 가 없으면 링크를 만들지 않는다. 일부만 주문서로 넘기면
  // 사용자는 무엇이 빠졌는지 알 수 없다 — 담기의 all-or-nothing 과 같은 규칙이다.
  return cartItemIds.length && cartItemIds.length === selected.length
    ? { type: "link", href: toOrderHref({ type: "cart", cartItemIds }) }
    : { type: "disabled" };
};
