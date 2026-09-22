"use client";

import { useCartSource } from "./useCartSource";
import { useGuestCart, useGuestCartCountQuery } from "./useGuestCart";
import { useMemberCart, useUserCartCountQuery } from "./useMemberCart";
import type { CartApi } from "../model/types";

/**
 * 복원 전에 어댑터를 부르면 실제로는 아무것도 전송하지 않는다. 문제는 `addItems` ·
 * `commitQuantity` 의 반환값이다 — `useCart` 는 이 값이 던지지 않으면 성공으로 읽어
 * `{status:"added"}` 와 성공 토스트를 낸다(`useAddToCartDraft.submit()` 도 `true` 를
 * 돌려준다). 조용히 resolve 하면 "복원 전이라 아무 데도 못 보냈다"가 "담았다"로 둔갑한다.
 * 그래서 이 둘만 reject 한다 — 나머지(`void` 를 돌려주는 메서드들)는 화면이 이미
 * 스켈레톤이라 조용히 아무 일도 하지 않아도 사용자에게 거짓 신호를 주지 않는다.
 *
 * 메시지를 비워 두는 이유: `readErrorInfo` 가 `error.message` 를 그대로 토스트에 띄운다
 * (`useCart.notifyFailure`). 빈 문자열이면 `message` 가 `undefined` 로 떨어져 i18n
 * 문구(`please_try_again`)로 대체된다 — 구현 세부사항이 사용자에게 그대로 노출되지 않는다.
 */
class CartUnresolvedError extends Error {
  constructor() {
    super();
    this.name = "CartUnresolvedError";
  }
}

const rejectUnresolved = () => Promise.reject(new CartUnresolvedError());

/** 복원이 끝나기 전에는 아직 무엇도 읽을 수 없다. 화면은 스켈레톤을 유지한다 */
const UNRESOLVED: CartApi = {
  data: undefined,
  isPending: true,
  isError: false,
  refetch: () => {},
  fetchCart: () => Promise.resolve(null),
  addItems: rejectUnresolved,
  setLineQuantity: () => {},
  // 지금은 담긴 라인이 있어야 도달하는 디바운스 뒤에서만 불려 실제로는 닿지 않는다(복원
  // 전에는 라인도 없다) — 그래도 그 전제가 나중에 깨질 때를 대비해 `addItems` 와 같은
  // 이유로 미리 막아 둔다.
  commitQuantity: rejectUnresolved,
  removeItems: () => {},
  removeAll: () => {},
};

/**
 * 회원·게스트 중 지금 유효한 장바구니.
 *
 * **회원/게스트 중 어느 어댑터를 쓸지 고르는 분기는 이 파일에만 있다** — 장바구니
 * 조작(`useCartApi`)과 뱃지 수(`useCartCount`), 이 두 훅이 그 분기의 seam 이다. 훅
 * 규칙상 둘 다 호출하되, 자기 차례가 아닌 쪽은 쿼리의 `enabled` 가 꺼져 아무것도 하지
 * 않는다.
 *
 * 다만 게스트 흔적이 남는 곳은 이 파일 하나가 아니다 — 심사 후 제거할 때는 최소
 * 아래 두 곳도 함께 봐야 한다.
 * - `entities/cart/model/cartOrderHref.ts` — `source.kind === "guest"` 면 무조건
 *   `/login` 으로 보내는 분기.
 * - `features/cart/ui/CartList.tsx` — 주문 링크를 만들려고 `useCartSource()` 를 한 번
 *   더 불러 같은 분기를 다시 읽는다.
 *
 * (전체 목록은 `apps/web/docs/cart.md` 와 설계 문서의 "심사 후 제거 절차" 참고.)
 */
export function useCartApi(): CartApi {
  const source = useCartSource();

  const member = useMemberCart();
  const guest = useGuestCart(source?.kind === "guest" ? source.guestId : null);

  if (!source) return UNRESOLVED;

  return source.kind === "member" ? member : guest;
}

/** 뱃지가 읽는 라인 수만 필요한 자리를 위한 최소 계약. `useCartApi` 의 `CartApi` 전체를
 * 끌어오면 헤더가 담기·삭제까지 볼 수 있어 보이므로 따로 둔다. */
interface CartCountApi {
  data?: { count: number };
}

/** 소스를 아직 모르면 뱃지도 아직 말할 수 없다 — `isReady` 판단은 `data` 가 `undefined`
 * 인 것만으로 충분해, `useCartApi` 의 `UNRESOLVED` 처럼 따로 pending 플래그가 필요 없다. */
const UNRESOLVED_COUNT: CartCountApi = { data: undefined };

/**
 * 헤더 배지가 읽는 라인 수. 조작(`useCartApi`)과 같은 이유로 분기가 이 파일에만 있다 —
 * `useCartBadgeCount` 는 이 훅 하나만 보고 회원인지 게스트인지 모른다.
 */
export function useCartCount(): CartCountApi {
  const source = useCartSource();

  const member = useUserCartCountQuery();
  const guest = useGuestCartCountQuery(
    source?.kind === "guest" ? source.guestId : null,
  );

  if (!source) return UNRESOLVED_COUNT;

  return source.kind === "member" ? member : guest;
}
