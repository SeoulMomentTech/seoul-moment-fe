"use client";

import { useEffect, useMemo, useState } from "react";

import type { HTTPError } from "ky";

import { useLanguage } from "@shared/lib/hooks";
import useAppQuery from "@shared/lib/hooks/query/useAppQuery";
import { useUserAuthStore } from "@shared/lib/hooks/useUserAuthStore";
import {
  postUserCartPreview,
  type GetUserCartRes,
} from "@shared/services/userCart";

import { userCartQueryKeys } from "@entities/cart";
import { keepPreviousData } from "@tanstack/react-query";

/** 선택을 연달아 바꿀 때 마지막 것만 묻는다 */
const PREVIEW_DELAY = 300;

/**
 * 장바구니 사이드 패널(혜택 진행 카드 · 결제 금액 요약)의 금액을 **고른 라인만** 서버에 묻는다.
 *
 * 장바구니 조회 금액은 장바구니 전체 기준이라 일부만 고르면 할인·배송비가 어긋난다. 장바구니
 * 미리보기에 고른 라인을 넘기면 서버가 그 라인만으로 계산한다. 배송비는 본섬 기준 예상값이다.
 * 아무것도 고르지 않았으면 부르지 않는다 (빈 배열은 400).
 *
 * 키가 장바구니 키 아래에 있어 수량 변경·삭제가 끝나 장바구니가 무효화되면 함께 다시 계산된다.
 */
export const useCartPreview = (selectedCartItemIds: ReadonlySet<number>) => {
  const userId = useUserAuthStore((state) => state.id);
  const languageCode = useLanguage();

  // Set 은 매 렌더 새로 만들어지므로 정렬한 배열로 바꿔 키를 안정시킨다.
  const cartItemIds = useMemo(
    () => [...selectedCartItemIds].sort((a, b) => a - b),
    [selectedCartItemIds],
  );
  const idsKey = cartItemIds.join(",");

  const [requestedIds, setRequestedIds] = useState(cartItemIds);

  useEffect(() => {
    const timer = setTimeout(() => setRequestedIds(cartItemIds), PREVIEW_DELAY);

    return () => clearTimeout(timer);
    // idsKey 가 바뀔 때만 다시 건다 — 배열 자체는 선택이 같아도 새로 만들어진다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsKey]);

  const query = useAppQuery<
    Awaited<ReturnType<typeof postUserCartPreview>>,
    HTTPError,
    GetUserCartRes
  >({
    queryKey: userCartQueryKeys.preview(userId, requestedIds, languageCode),
    queryFn: () =>
      postUserCartPreview({ cartItemIds: requestedIds, languageCode }),
    select: (res) => res.data,
    enabled: requestedIds.length > 0 && !!userId,
    // 선택을 바꾸는 동안 패널이 비지 않게 직전 금액을 들고 있는다
    placeholderData: keepPreviousData,
    staleTime: 0,
  });

  const hasSelection = cartItemIds.length > 0;

  return {
    /** 고른 라인 기준 서버 금액. 고른 것이 없거나 첫 응답 전·실패면 undefined */
    preview: hasSelection ? query.data : undefined,
    /** 지금 보이는 금액이 직전 선택·수량 기준이라 다시 계산 중인지 */
    isRecalculating:
      hasSelection &&
      (requestedIds.join(",") !== idsKey ||
        query.isFetching ||
        query.isPlaceholderData),
  };
};
