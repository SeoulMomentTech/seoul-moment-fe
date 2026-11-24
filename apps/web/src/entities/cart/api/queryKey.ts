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

  /**
   * 체크한 라인만의 금액. 장바구니 키 아래에 둬서 수량 변경·삭제·담기가 장바구니를 무효화할 때
   * 함께 다시 계산된다 — 같은 라인이어도 수량이 바뀌면 금액이 달라진다.
   */
  preview: (
    userId: number,
    cartItemIds: ReadonlyArray<number>,
    languageCode: LanguageType,
  ) =>
    [
      ...USER_CART_QUERY_KEY,
      "preview",
      userId,
      cartItemIds,
      languageCode,
    ] as const,
};
