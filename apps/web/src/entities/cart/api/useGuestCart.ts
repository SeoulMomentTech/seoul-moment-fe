"use client";

import { useCallback, useMemo } from "react";

import type { HTTPError } from "ky";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { useLanguage } from "@shared/lib/hooks";
import useAppQuery from "@shared/lib/hooks/query/useAppQuery";
import {
  createGuestCartItems,
  deleteGuestCart,
  deleteGuestCartItem,
  getGuestCart,
  getGuestCartCount,
  updateGuestCartItem,
  type GetGuestCartCountRes,
  type GetGuestCartRes,
} from "@shared/services/guestCart";

import type { LanguageType } from "@/i18n/const";

import type { CommonRes } from "@shared/services";
import { useQueryClient } from "@tanstack/react-query";

import { guestCartQueryKeys } from "./queryKey";
import { isGuestCartGoneError } from "../lib/cartError";
import { getCartItemUnitPrice } from "../model/cartSelectors";
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
function useGuestCartKeys(guestId: string | null, languageCode: LanguageType) {
  return useMemo(
    () => ({
      list: guestCartQueryKeys.list(guestId, languageCode),
      count: guestCartQueryKeys.count(guestId),
    }),
    [guestId, languageCode],
  );
}

/**
 * 첫 담기로 발급 중인 게스트 ID.
 *
 * **모듈 스코프**여야 한다 — `useRef` 로 두면 훅 인스턴스마다(예: 헤더 뱃지와 상품 상세의
 * 담기 버튼이 동시에 `useGuestCart` 를 부르는 경우) 서로 다른 "진행 중" 상태를 갖게 되어,
 * 두 인스턴스가 동시에 헤더 없는 첫 담기를 보낼 수 있다 — 이 가드가 막으려는 바로 그
 * 카트 분할이 그대로 재현된다.
 */
let issuingGuestId: Promise<string> | null = null;

/**
 * 게스트 장바구니 어댑터.
 *
 * 회원 어댑터와 다른 점은 셋뿐이다 — 주인이 헤더의 `guestId` 이고, 그 ID 가 첫 담기
 * 응답으로만 발급되며, 라인을 `productVariantId` 로 가리킨다. 나머지(디바운스·409 정정·
 * 실패 토스트)는 `useCart` 가 회원과 똑같이 처리한다.
 */
export function useGuestCart(guestId: string | null): CartApi {
  const t = useTranslations();
  const queryClient = useQueryClient();
  const languageCode = useLanguage();
  const setGuestId = useGuestCartIdStore((s) => s.setGuestId);
  const clearGuestId = useGuestCartIdStore((s) => s.clearGuestId);

  const keys = useGuestCartKeys(guestId, languageCode);

  const invalidate = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: guestCartQueryKeys.all });
  }, [queryClient]);

  /**
   * 404 는 "이 게스트 카트는 더 이상 없다" 는 뜻이다. ID 를 버리고 빈 카트로 돌아간다.
   *
   * 항상 다시 던진다 — 호출부마다 필요한 모양(쿼리 에러로 흘리기, 결과값으로 죽이기,
   * `allSettled` 로 모으기)이 다르므로, 여기서는 부수효과만 하고 판단은 호출부에 맡긴다.
   */
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

  /** 실패를 사용자에게 알린다. 어떤 라인이 막혔는지 짚을 수 없는 집계 실패용 범용 문구 */
  const notifyFailure = useCallback(() => {
    toast.error(t("please_try_again"));
  }, [t]);

  const { data, isPending, isError, refetch } = useAppQuery<
    Awaited<ReturnType<typeof getGuestCart>>,
    HTTPError,
    GetGuestCartRes
  >({
    queryKey: keys.list,
    // 조회 자체의 404 도 카트가 사라졌다는 신호다. 여기서 놓치면 ID 가 localStorage 에
    // 영영 남아 다음 방문마다 같은 404 를 반복한다 — 여기서 걸러 빈 카트로 돌아간다.
    queryFn: () =>
      getGuestCart({ guestId: guestId as string, languageCode }).catch(
        handleError,
      ),
    select: (res) => res.data,
    enabled: !!guestId,
    persist: true,
  });

  const addItems = useCallback<CartApi["addItems"]>(
    async (items) => {
      const pendingId = guestId ? null : issuingGuestId;
      // 앞선 담기가 실패했으면 그 실패를 물려받지 않는다 — 이 호출은 자기 것을 새로 낸다.
      const id = pendingId ? await pendingId.catch(() => null) : guestId;

      const request = createGuestCartItems({
        guestId: id ?? undefined,
        items: [...items],
      });

      if (!id) {
        const issued = request.then((res) => res.data.guestId);
        issuingGuestId = issued;
        // 대기자가 없어도(단독 첫 담기가 실패하는 경우) unhandled rejection 이 나지
        // 않도록 별도로 처리한다. 대기자가 있다면 위의 `.catch(() => null)` 이 따로 또
        // 붙으므로 서로 방해하지 않는다.
        void issued
          .catch(() => null)
          .finally(() => {
            if (issuingGuestId === issued) issuingGuestId = null;
          });
      }

      const res = await request.catch(handleError);

      setGuestId(res.data.guestId);
      // 방금 응답이 준(새로 발급됐을 수 있는) ID 로 뱃지를 채운다. 렌더 시점의
      // `keys.count` 는 첫 담기라면 아직 guestId 가 없던 때의 키라, 그 자리에 쓰면
      // 아무도 읽지 않는 캐시가 된다.
      queryClient.setQueryData<CommonRes<GetGuestCartCountRes>>(
        guestCartQueryKeys.count(res.data.guestId),
        { result: true, data: { count: res.data.totalCount } },
      );
      // 회원 쪽과 같은 이유로 list 만 무효화한다(`useCreateUserCartItemsMutation` 참고).
      // 전체(`invalidate()`)를 쓰면 방금 위에서 쓴 count 캐시를 스스로 지운다.
      void queryClient.invalidateQueries({ queryKey: keys.list });
    },
    [guestId, handleError, keys.list, queryClient, setGuestId],
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
                            totalPrice: getCartItemUnitPrice(item) * quantity,
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
        .catch(handleError)
        .catch(() => null);
    }, [guestId, handleError, languageCode, keys.list, queryClient]),
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

        // 게스트 API 에는 선택 삭제가 없다. 라인마다 부른다 — 404 를 만난 라인은
        // `handleError` 가 ID 를 버리고, 그 외의 실패도 여기서는 던져 `allSettled` 로
        // 모은다. 하나라도 실패하면 재조회로 화면을 서버에 맞추고, 조용히 사라진
        // 것처럼 보이지 않도록 사용자에게도 알린다.
        void Promise.allSettled(
          productVariantIds.map((productVariantId) =>
            deleteGuestCartItem({ guestId, productVariantId }).catch(
              handleError,
            ),
          ),
        ).then((results) => {
          invalidate();

          if (results.some((result) => result.status === "rejected")) {
            notifyFailure();
          }
        });
      },
      [guestId, handleError, invalidate, notifyFailure],
    ),
    removeAll: useCallback(() => {
      if (!guestId) return;

      void deleteGuestCart(guestId)
        .catch(handleError)
        .catch(() => null)
        .finally(invalidate);
    }, [guestId, handleError, invalidate]),
  };
}

/**
 * @description 게스트 장바구니 라인 수. ID 가 없으면 요청하지 않고 0 이다
 */
export function useGuestCartCountQuery(guestId: string | null) {
  return useAppQuery<
    Awaited<ReturnType<typeof getGuestCartCount>>,
    HTTPError,
    GetGuestCartCountRes
  >({
    queryKey: guestCartQueryKeys.count(guestId),
    queryFn: () => getGuestCartCount(guestId as string),
    select: (res) => res.data,
    enabled: !!guestId,
    persist: true,
  });
}
