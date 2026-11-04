import type { LanguageType } from "@/i18n/const";

import type { OrderSource } from "../model/orderSource";

export const ORDER_QUERY_KEY = ["order"] as const;

export interface OrderPreviewKeyInput {
  /** null 이면 호출하지 않지만 키는 안정적으로 유지한다 */
  source: OrderSource | null;
  languageCode: LanguageType;
  shippingType?: "HOME" | "CVS";
  city?: string;
  district?: string;
  cvsStoreToken?: string;
}

/**
 * 주문 상세는 사용자별 데이터라 키에 userId 를 넣는다 — 다른 계정으로 다시 로그인했을 때
 * 이전 사용자의 주문이 캐시에서 보이지 않게 하려는 장바구니와 같은 이유다.
 */
export const orderQueryKeys = {
  all: ORDER_QUERY_KEY,

  preview: ({
    source,
    languageCode,
    shippingType = "HOME",
    city,
    district,
    cvsStoreToken,
  }: OrderPreviewKeyInput) =>
    [
      ...ORDER_QUERY_KEY,
      "preview",
      source,
      shippingType,
      city,
      district,
      cvsStoreToken,
      languageCode,
    ] as const,

  detail: (userId: number, orderId: number | null) =>
    [...ORDER_QUERY_KEY, "detail", userId, orderId] as const,
};
