"use client";

// 이 파일 자체에는 훅이 없지만 "use client" 가 필요하다 — `@entities/order` 를 거쳐
// 클라이언트 전용 코드(`useOrderPreviewQuery` 등)를 끌어오므로, 이 모듈이 서버 컴포넌트
// 그래프(entities/cart 배럴 → app/[locale]/layout.tsx)에서 계속 닿을 수 있다. 지우지 말 것.

import { toOrderHref } from "@entities/order";

import type { CartSource } from "./cartSource";
import type { CartLine } from "./types";

interface ToCartOrderHrefArgs {
  source: CartSource | null;
  lines: ReadonlyArray<CartLine>;
  selectedVariantIds: ReadonlySet<number>;
}

/**
 * 장바구니의 `주문하기` 가 갈 곳.
 *
 * 주문·결제는 회원 전용이다(서버가 게스트 주문을 지원하지 않는다). 게스트는 같은 자리에서
 * 로그인으로 보낸다 — 빈 주문서로 보내는 것보다 정직하고, 게스트 라인은 `cartItemId` 가
 * 없어 주문서가 받을 수도 없다.
 *
 * 고른 것이 없으면 `null` 이고 버튼은 비활성이다.
 */
export const toCartOrderHref = ({
  source,
  lines,
  selectedVariantIds,
}: ToCartOrderHrefArgs): string | null => {
  if (!source || selectedVariantIds.size === 0) return null;

  if (source.kind === "guest") return "/login";

  const selected = lines.filter((line) =>
    selectedVariantIds.has(line.productVariantId),
  );

  const cartItemIds = selected
    .map((line) => line.cartItemId)
    .filter((cartItemId): cartItemId is number => cartItemId != null);

  // 고른 라인 중 하나라도 서버 id 가 없으면 링크를 만들지 않는다. 일부만 주문서로 넘기면
  // 사용자는 무엇이 빠졌는지 알 수 없다 — 담기의 all-or-nothing 과 같은 규칙이다.
  return cartItemIds.length && cartItemIds.length === selected.length
    ? toOrderHref({ type: "cart", cartItemIds })
    : null;
};
