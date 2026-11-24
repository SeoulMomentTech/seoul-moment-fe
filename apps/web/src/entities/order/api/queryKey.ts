import type { UserOrderListStatusFilter } from "@shared/services/userOrder";

import type { LanguageType } from "@/i18n/const";

import type { OrderSource } from "../model/orderSource";

export const ORDER_QUERY_KEY = ["order"] as const;

export interface OrderListKeyInput {
  status: UserOrderListStatusFilter;
  months?: number;
  count: number;
  languageCode: LanguageType;
}

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
 * 주문 목록·상세는 사용자별 데이터라 키에 userId 를 넣는다 — 다른 계정으로 다시 로그인했을 때
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

  list: (userId: number, params: OrderListKeyInput) =>
    [...ORDER_QUERY_KEY, "list", userId, params] as const,

  /**
   * 장바구니 사이드 패널 금액. 고른 라인과 장바구니가 바뀐 시각을 키에 넣는다 — 같은 라인이라도
   * 수량이 바뀌면 다시 계산해야 하는데, 수량은 장바구니 캐시가 바뀐 시각으로 드러난다.
   */
  cartPreview: (
    userId: number,
    cartItemIds: ReadonlyArray<number>,
    cartUpdatedAt: number,
    languageCode: LanguageType,
  ) =>
    [
      ...ORDER_QUERY_KEY,
      "cart-preview",
      userId,
      cartItemIds,
      cartUpdatedAt,
      languageCode,
    ] as const,

  detail: (
    userId: number,
    orderId: number | null,
    languageCode: LanguageType,
  ) => [...ORDER_QUERY_KEY, "detail", userId, orderId, languageCode] as const,
};
