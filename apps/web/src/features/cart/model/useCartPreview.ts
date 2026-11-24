"use client";

import { useEffect, useMemo, useState } from "react";

import type { HTTPError } from "ky";

import { useLanguage } from "@shared/lib/hooks";
import useAppQuery from "@shared/lib/hooks/query/useAppQuery";
import { useUserAuthStore } from "@shared/lib/hooks/useUserAuthStore";
import {
  postUserOrderPreview,
  type PostUserOrderPreviewRes,
} from "@shared/services/userOrder";

import { orderQueryKeys } from "@entities/order";
import { keepPreviousData } from "@tanstack/react-query";

/** 선택을 연달아 바꿀 때 마지막 것만 묻는다 */
const PREVIEW_DELAY = 300;

interface CartPreviewInput {
  cartItemIds: number[];
  cartUpdatedAt: number;
}

/**
 * 장바구니 사이드 패널(혜택 진행 카드 · 결제 금액 요약)의 금액을 **고른 라인만** 서버에 묻는다.
 *
 * 장바구니 조회 금액은 장바구니 전체 기준이라 일부만 고르면 할인·배송비가 어긋난다. 주문서
 * 미리보기에 고른 라인을 그대로 넘기면 서버가 그 라인만으로 계산해 주문서와 같은 값이 나온다.
 * 주소 없이 부르므로 배송비는 본섬 기준 예상값이다. 아무것도 고르지 않았으면 부르지 않는다.
 *
 * TODO: 서버에 장바구니 전용 미리보기 API(cart/preview, 응답 동일)가 생기면 `queryFn` 만 교체한다.
 */
export const useCartPreview = (
  selectedCartItemIds: ReadonlySet<number>,
  cartUpdatedAt: number,
) => {
  const userId = useUserAuthStore((state) => state.id);
  const languageCode = useLanguage();

  // Set 은 매 렌더 새로 만들어지므로 정렬한 배열로 바꿔 키를 안정시킨다.
  const cartItemIds = useMemo(
    () => [...selectedCartItemIds].sort((a, b) => a - b),
    [selectedCartItemIds],
  );
  const idsKey = cartItemIds.join(",");

  const [input, setInput] = useState<CartPreviewInput>({
    cartItemIds,
    cartUpdatedAt,
  });

  useEffect(() => {
    const timer = setTimeout(
      () => setInput({ cartItemIds, cartUpdatedAt }),
      PREVIEW_DELAY,
    );

    return () => clearTimeout(timer);
    // idsKey 가 바뀔 때만 다시 건다 — 배열 자체는 선택이 같아도 새로 만들어진다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsKey, cartUpdatedAt]);

  const query = useAppQuery<
    Awaited<ReturnType<typeof postUserOrderPreview>>,
    HTTPError,
    PostUserOrderPreviewRes
  >({
    queryKey: orderQueryKeys.cartPreview(
      userId,
      input.cartItemIds,
      input.cartUpdatedAt,
      languageCode,
    ),
    queryFn: () =>
      postUserOrderPreview({ cartItemIds: input.cartItemIds, languageCode }),
    select: (res) => res.data,
    enabled: input.cartItemIds.length > 0 && !!userId,
    // 선택을 바꾸는 동안 패널이 비지 않게 직전 금액을 들고 있는다
    placeholderData: keepPreviousData,
    staleTime: 0,
  });

  const hasSelection = cartItemIds.length > 0;
  const isSettled =
    input.cartItemIds.join(",") === idsKey &&
    input.cartUpdatedAt === cartUpdatedAt;

  return {
    /** 고른 라인 기준 서버 금액. 고른 것이 없거나 첫 응답 전·실패면 undefined */
    preview: hasSelection ? query.data : undefined,
    /** 지금 보이는 금액이 직전 선택·수량 기준이라 다시 계산 중인지 */
    isRecalculating:
      hasSelection &&
      (!isSettled || query.isFetching || query.isPlaceholderData),
  };
};
