"use client";

import { useOrderPreviewQuery, type OrderSource } from "@entities/order";

import type { OrderPreviewShipping } from "./useOrderShipping";

interface UseOrderItemsParams {
  /** 주문 대상. URL 에 없거나 잘못됐으면 `null` 이고 호출하지 않는다 */
  source: OrderSource | null;
  /** 배송비를 정하는 입력. 택배는 縣市·區, 편의점은 매장 토큰 */
  previewShipping: OrderPreviewShipping;
}

/**
 * 주문서에 그릴 라인과 금액.
 *
 * 목록도 합계도 미리보기 응답 하나에서 읽는다. 장바구니 주문이든 "구매하기" 든 서버가
 * 같은 모양으로 돌려주므로 화면은 두 경로를 구분하지 않는다. 라인과 합계가 한 응답에서
 * 나오니 서로 어긋날 수도 없다 — 목록은 장바구니에서, 합계는 미리보기에서 읽으면 다른
 * 탭에서 수량을 바꾼 순간 둘이 갈라지고 어느 쪽이 옳은지 화면에서 알 수 없어진다.
 */
export const useOrderItems = ({
  source,
  previewShipping,
}: UseOrderItemsParams) => {
  const {
    data: preview,
    isPending,
    isError,
    isPlaceholderData,
    refetch,
  } = useOrderPreviewQuery(
    previewShipping.shippingType === "CVS"
      ? // 매장이 정해지기 전에는 서버가 어차피 본섬 기준 예상값을 주므로 배송 입력을 아예
        // 보내지 않는다 — 택배의 "주소 없음"과 같은 요청이라 캐시도 한 줄로 합쳐진다.
        previewShipping.cvsStoreToken
        ? {
            source,
            shippingType: "CVS",
            cvsStoreToken: previewShipping.cvsStoreToken,
          }
        : { source }
      : {
          source,
          city: previewShipping.city,
          district: previewShipping.district,
        },
  );

  const groups = preview?.brandGroups ?? [];

  return {
    source,
    preview,
    groups,
    itemCount: groups.reduce((count, group) => count + group.items.length, 0),
    isPending,
    isError,
    refetch,
    /** 주소를 바꿔 금액을 다시 묻는 중. 지금 보이는 배송비는 직전 주소 기준이다 */
    isRecalculating: isPlaceholderData,
    /** URL 에 주문 대상이 없거나, cart 와 buy 를 같이 보내 무효인 경우 */
    hasNoSelection: source === null,
  };
};
