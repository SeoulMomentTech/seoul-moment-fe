"use client";

import { useCallback, useMemo, useRef } from "react";

import type { HTTPError } from "ky";

import { useLanguage } from "@shared/lib/hooks";
import useAppQuery from "@shared/lib/hooks/query/useAppQuery";
import {
  createGuestCartItems,
  deleteGuestCart,
  deleteGuestCartItem,
  getGuestCart,
  updateGuestCartItem,
  type GetGuestCartCountRes,
  type GetGuestCartRes,
} from "@shared/services/guestCart";

import type { CommonRes } from "@shared/services";
import { useQueryClient } from "@tanstack/react-query";

import { guestCartQueryKeys } from "./queryKey";
import { isGuestCartGoneError } from "../lib/cartError";
import { useGuestCartIdStore } from "../model/guestId";
import type { CartApi } from "../model/types";

/**
 * 이 게스트·언어의 장바구니 캐시 키.
 *
 * `guestCartQueryKeys.list(...)` 는 호출마다 새 배열을 만든다(회원 쪽 `userCartQueryKeys`
 * 와 같은 이유 — `useUserCartKeys` 참고). 여기서 `useMemo` 로 고정하지 않으면 이 값을
 * 의존성으로 쓰는 콜백(`addItems`·`setLineQuantity` 등)이 렌더마다 다시 만들어지고,
 * 그 콜백들에 의존하는 `useCart` 의 디바운스도 렌더마다 새 타이머를 갖게 된다.
 */
function useGuestCartKeys(guestId: string | null) {
  const languageCode = useLanguage();

  return useMemo(
    () => ({
      list: guestCartQueryKeys.list(guestId, languageCode),
      count: guestCartQueryKeys.count(guestId),
    }),
    [guestId, languageCode],
  );
}

/**
 * 게스트 장바구니 어댑터.
 *
 * 회원 어댑터와 다른 점은 셋뿐이다 — 주인이 헤더의 `guestId` 이고, 그 ID 가 첫 담기
 * 응답으로만 발급되며, 라인을 `productVariantId` 로 가리킨다. 나머지(디바운스·409 정정·
 * 실패 토스트)는 `useCart` 가 회원과 똑같이 처리한다.
 */
export function useGuestCart(guestId: string | null): CartApi {
  const queryClient = useQueryClient();
  const languageCode = useLanguage();
  const setGuestId = useGuestCartIdStore((s) => s.setGuestId);
  const clearGuestId = useGuestCartIdStore((s) => s.clearGuestId);

  const keys = useGuestCartKeys(guestId);

  // `query` 객체 자체가 아니라 필요한 값만 뽑아 쓴다. tanstack query 가 렌더마다 새
  // 결과 객체를 돌려주므로, `query` 를 통째로 의존성에 넣으면 `refetch` 콜백이 렌더마다
  // 다시 만들어진다 — `refetch` 함수 자체는 안정적이니 그것만 닫아 두면 된다.
  const { data, isPending, isError, refetch } = useAppQuery<
    Awaited<ReturnType<typeof getGuestCart>>,
    HTTPError,
    GetGuestCartRes
  >({
    queryKey: keys.list,
    queryFn: () => getGuestCart({ guestId: guestId as string, languageCode }),
    select: (res) => res.data,
    enabled: !!guestId,
    persist: true,
  });

  const invalidate = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: guestCartQueryKeys.all });
  }, [queryClient]);

  /** 404 는 "이 게스트 카트는 더 이상 없다" 는 뜻이다. ID 를 버리고 빈 카트로 돌아간다 */
  const handleError = useCallback(
    (error: unknown) => {
      if (isGuestCartGoneError(error)) {
        clearGuestId();
        invalidate();
      }

      throw error;
    },
    [clearGuestId, invalidate],
  );

  // ID 가 없을 때의 첫 담기. 진행 중인 요청이 있으면 그것이 발급한 ID 를 기다렸다가 쓴다 —
  // 헤더 없는 요청을 둘 보내면 서버가 카트를 둘 만든다.
  const issuing = useRef<Promise<string> | null>(null);

  const addItems = useCallback<CartApi["addItems"]>(
    async (items) => {
      const pendingId = guestId ? null : issuing.current;
      const id = pendingId ? await pendingId : guestId;

      const request = createGuestCartItems({
        guestId: id ?? undefined,
        items: [...items],
      });

      if (!id) {
        issuing.current = request
          .then((res) => res.data.guestId)
          .finally(() => {
            issuing.current = null;
          });
      }

      const res = await request.catch(handleError);

      setGuestId(res.data.guestId);
      queryClient.setQueryData<CommonRes<GetGuestCartCountRes>>(keys.count, {
        result: true,
        data: { count: res.data.totalCount },
      });
      invalidate();
    },
    [guestId, handleError, invalidate, keys.count, queryClient, setGuestId],
  );

  const setLineQuantity = useCallback<CartApi["setLineQuantity"]>(
    (productVariantId, quantity) => {
      queryClient.setQueryData<CommonRes<GetGuestCartRes>>(
        keys.list,
        (cache) =>
          cache
            ? {
                ...cache,
                data: {
                  ...cache.data,
                  brandGroups: cache.data.brandGroups.map((group) => ({
                    ...group,
                    items: group.items.map((item) =>
                      item.productVariantId === productVariantId
                        ? {
                            ...item,
                            quantity,
                            totalPrice:
                              (item.discountPrice && item.discountPrice > 0
                                ? item.discountPrice
                                : item.price) * quantity,
                          }
                        : item,
                    ),
                  })),
                },
              }
            : cache,
      );
    },
    [keys.list, queryClient],
  );

  return {
    // guestId 가 없으면 담은 적이 없는 게스트다. 비활성 쿼리의 pending 을 그대로 흘리면
    // 화면이 스켈레톤에서 빠져나오지 못한다.
    data: guestId ? data : undefined,
    isPending: !!guestId && isPending,
    isError,
    refetch: useCallback(() => void refetch(), [refetch]),
    fetchCart: useCallback(async () => {
      if (!guestId) return null;

      return queryClient
        .fetchQuery({
          queryKey: keys.list,
          queryFn: () => getGuestCart({ guestId, languageCode }),
          meta: { logError: false, persist: true },
        })
        .then((res) => res.data)
        .catch(() => null);
    }, [guestId, languageCode, keys.list, queryClient]),
    addItems,
    setLineQuantity,
    commitQuantity: useCallback(
      async (productVariantId, quantity) => {
        if (!guestId) return;

        await updateGuestCartItem({ guestId, productVariantId, quantity })
          .catch(handleError)
          .finally(invalidate);
      },
      [guestId, handleError, invalidate],
    ),
    removeItems: useCallback(
      (productVariantIds) => {
        if (!guestId || !productVariantIds.length) return;

        // 게스트 API 에는 선택 삭제가 없다. 라인마다 부르고, 하나라도 실패하면 재조회로
        // 화면을 서버에 맞춘다.
        void Promise.allSettled(
          productVariantIds.map((productVariantId) =>
            deleteGuestCartItem({ guestId, productVariantId }),
          ),
        ).then(invalidate);
      },
      [guestId, invalidate],
    ),
    removeAll: useCallback(() => {
      if (!guestId) return;

      void deleteGuestCart(guestId)
        .catch(() => null)
        .finally(invalidate);
    }, [guestId, invalidate]),
  };
}
