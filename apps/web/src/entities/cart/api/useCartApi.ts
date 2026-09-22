"use client";

import { useCartSource } from "./useCartSource";
import { useGuestCart } from "./useGuestCart";
import { useMemberCart } from "./useMemberCart";
import type { CartApi } from "../model/types";

/** 복원이 끝나기 전에는 아직 무엇도 읽을 수 없다. 화면은 스켈레톤을 유지한다 */
const UNRESOLVED: CartApi = {
  data: undefined,
  isPending: true,
  isError: false,
  refetch: () => {},
  fetchCart: () => Promise.resolve(null),
  addItems: () => Promise.resolve(),
  setLineQuantity: () => {},
  commitQuantity: () => Promise.resolve(),
  removeItems: () => {},
  removeAll: () => {},
};

/**
 * 회원·게스트 중 지금 유효한 장바구니.
 *
 * **게스트 분기는 이 파일에만 있다.** 심사가 끝나 게스트 모듈을 걷어낼 때 고칠 곳도 여기다.
 * 훅 규칙상 둘 다 호출하되, 자기 차례가 아닌 쪽은 쿼리의 `enabled` 가 꺼져 아무것도 하지 않는다.
 */
export function useCartApi(): CartApi {
  const source = useCartSource();

  const member = useMemberCart();
  const guest = useGuestCart(source?.kind === "guest" ? source.guestId : null);

  if (!source) return UNRESOLVED;

  return source.kind === "member" ? member : guest;
}
