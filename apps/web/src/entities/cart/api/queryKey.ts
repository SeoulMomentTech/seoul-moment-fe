import type { LanguageType } from "@/i18n/const";

export const USER_CART_QUERY_KEY = ["user", "cart"] as const;

/**
 * 장바구니는 사용자별 데이터라 키에 userId 를 넣는다.
 * 로그아웃 후 다른 계정으로 로그인했을 때 이전 사용자의 캐시를 그대로 보여주지 않기 위해서다.
 */
export const userCartQueryKeys = {
  all: USER_CART_QUERY_KEY,

  list: (userId: number, languageCode: LanguageType) =>
    [...USER_CART_QUERY_KEY, "list", userId, languageCode] as const,

  count: (userId: number) => [...USER_CART_QUERY_KEY, "count", userId] as const,
};

export const GUEST_CART_QUERY_KEY = ["guest", "cart"] as const;

/**
 * 게스트 장바구니 키. 회원 키의 userId 자리를 guestId 가 대신한다 —
 * ID 가 바뀌면(발급·폐기) 이전 카트의 캐시가 그대로 보이면 안 된다.
 */
export const guestCartQueryKeys = {
  all: GUEST_CART_QUERY_KEY,

  list: (guestId: string | null, languageCode: LanguageType) =>
    [...GUEST_CART_QUERY_KEY, "list", guestId, languageCode] as const,

  count: (guestId: string | null) =>
    [...GUEST_CART_QUERY_KEY, "count", guestId] as const,
};
