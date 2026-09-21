/**
 * 지금 어느 장바구니를 쓰는지.
 *
 * 서버는 회원(`user/cart`)과 게스트(`guest/cart`)에 서로 다른 인증 수단을 요구하지만,
 * 화면은 이 타입 하나만 들고 다닌다 — 분기는 `useCartApi` 한 곳에 있다.
 * (`entities/order/model/orderSource.ts` 와 같은 어휘다.)
 */
export type CartSource =
  | { kind: "member" }
  | { kind: "guest"; guestId: string | null };

interface ResolveCartSourceArgs {
  hasAuthHydrated: boolean;
  isAuthenticated: boolean;
  hasGuestHydrated: boolean;
  guestId: string | null;
}

/**
 * 두 store 의 복원이 끝나기 전에는 `null` 이다 — "게스트다" 와 "아직 모른다" 는 다르다.
 * 복원 전에 게스트로 단정하면 로그인 사용자의 장바구니가 한 번 비었다가 채워진다.
 */
export const resolveCartSource = ({
  hasAuthHydrated,
  isAuthenticated,
  hasGuestHydrated,
  guestId,
}: ResolveCartSourceArgs): CartSource | null => {
  if (!hasAuthHydrated || !hasGuestHydrated) return null;

  return isAuthenticated ? { kind: "member" } : { kind: "guest", guestId };
};
