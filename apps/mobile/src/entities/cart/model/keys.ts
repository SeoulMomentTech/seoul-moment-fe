import type { LanguageType } from "@shared/lib/i18n/language";

/**
 * 장바구니 쿼리 키의 머리. 수량 변경·삭제가 목록과 뱃지 수를 한꺼번에 무효화해야 하므로
 * 둘이 같은 머리를 공유한다 — 머리 하나만 invalidate 하면 둘 다 다시 묻는다.
 */
export const USER_CART_KEY = ["user", "cart"] as const;

/**
 * 키에는 요청 함수가 읽는 값이 전부 들어간다.
 *
 * - userId: 로그아웃 뒤 다른 계정으로 들어왔을 때 앞사람의 장바구니가 비치면 안 된다.
 * - languageCode: 상품명·옵션 텍스트가 언어를 탄다(Accept-language 로 나간다).
 *   수량 조회(count)는 숫자 하나뿐이라 언어를 읽지 않으므로 키에도 넣지 않는다.
 */
export const userCartKeys = {
  all: USER_CART_KEY,

  list: (userId: number, languageCode: LanguageType) =>
    [...USER_CART_KEY, "list", userId, languageCode] as const,

  count: (userId: number) => [...USER_CART_KEY, "count", userId] as const,
};
