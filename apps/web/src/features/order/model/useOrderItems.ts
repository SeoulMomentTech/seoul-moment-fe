"use client";

import { useOrderPreviewQuery, useOrderSource } from "@entities/order";

interface UseOrderItemsParams {
  /** 배송지 縣市. 있으면 배송비가 확정된다 */
  city?: string;
  /** 배송지 區/鄉 */
  district?: string;
}

/**
 * 주문서에 그릴 라인과 금액.
 *
 * 목록도 합계도 미리보기 응답 하나에서 읽는다. 장바구니 주문이든 "구매하기" 든 서버가
 * 같은 모양으로 돌려주므로 화면은 두 경로를 구분하지 않는다. 라인과 합계가 한 응답에서
 * 나오니 서로 어긋날 수도 없다 — 목록은 장바구니에서, 합계는 미리보기에서 읽으면 다른
 * 탭에서 수량을 바꾼 순간 둘이 갈라지고 어느 쪽이 옳은지 화면에서 알 수 없어진다.
 */
export const useOrderItems = ({ city, district }: UseOrderItemsParams) => {
  const source = useOrderSource();

  const {
    data: preview,
    isPending,
    isError,
    isPlaceholderData,
    refetch,
  } = useOrderPreviewQuery({ source, city, district });

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
