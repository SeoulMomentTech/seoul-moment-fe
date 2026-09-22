"use client";

import { useCallback, useMemo } from "react";

import type { HTTPError } from "ky";

import { useLanguage } from "@shared/lib/hooks";
import useAppMutation from "@shared/lib/hooks/query/useAppMutation";
import useAppQuery from "@shared/lib/hooks/query/useAppQuery";
import { useUserAuthStore } from "@shared/lib/hooks/useUserAuthStore";
import {
  createUserCartItems,
  deleteUserCartItems,
  getUserCart,
  getUserCartCount,
  updateUserCartItem,
  type CreateUserCartItemsReq,
  type GetUserCartCountRes,
  type GetUserCartRes,
  type UpdateUserCartItemReq,
  type UserCartItem,
} from "@shared/services/userCart";

import type { CommonRes } from "@shared/services";
import { useQueryClient } from "@tanstack/react-query";

import { userCartQueryKeys } from "./queryKey";
import { getCartItemUnitPrice } from "../model/cartSelectors";
import type { CartApi } from "../model/types";

type CartListCache = CommonRes<GetUserCartRes>;
type CartCountCache = CommonRes<GetUserCartCountRes>;

/**
 * 이 사용자·언어의 장바구니 캐시 키. 낙관적 업데이트가 매번 필요로 한다.
 *
 * `userCartQueryKeys.list(...)` 는 매번 새 배열을 만든다. 여기서 `useMemo` 로 고정하지
 * 않으면 이 값을 의존성으로 쓰는 콜백(`toCartItemId` 등)이 렌더마다 다시 만들어지고,
 * 그 콜백들에 의존하는 디바운스(`useCart`)도 렌더마다 새 타이머를 갖게 된다.
 */
function useUserCartKeys() {
  const languageCode = useLanguage();
  const id = useUserAuthStore((state) => state.id);

  return useMemo(
    () => ({
      list: userCartQueryKeys.list(id, languageCode),
      count: userCartQueryKeys.count(id),
    }),
    [id, languageCode],
  );
}

/** 라인을 걷어내고 빈 브랜드 묶음까지 정리한다. 상품 없는 브랜드 헤더만 남으면 안 된다 */
const dropCartItems = (
  cache: CartListCache,
  cartItemIds: ReadonlySet<number>,
): CartListCache => {
  const brandGroups = cache.data.brandGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => !cartItemIds.has(item.cartItemId)),
    }))
    .filter((group) => group.items.length > 0);

  return {
    ...cache,
    data: {
      ...cache.data,
      brandGroups,
      totalCount: brandGroups.reduce((total, g) => total + g.items.length, 0),
    },
  };
};

const listCacheItemIds = (cache: CartListCache): Set<number> =>
  new Set(
    cache.data.brandGroups.flatMap((group) =>
      group.items.map((item) => item.cartItemId),
    ),
  );

/**
 * @description 장바구니 조회
 */
export function useUserCartQuery({ enabled }: { enabled?: boolean } = {}) {
  const languageCode = useLanguage();
  const { id } = useUserAuthStore();

  return useAppQuery<
    Awaited<ReturnType<typeof getUserCart>>,
    HTTPError,
    GetUserCartRes
  >({
    queryKey: userCartQueryKeys.list(id, languageCode),
    queryFn: () => getUserCart({ languageCode }),
    select: (res) => res.data,
    enabled: enabled !== false && !!id,
    // 새로고침 직후 빈 장바구니가 깜박이지 않도록 캐시를 localStorage 에 남긴다.
    persist: true,
  });
}

/**
 * @description 장바구니 라인 수 조회 (헤더 뱃지용)
 */
export function useUserCartCountQuery({ enabled }: { enabled?: boolean } = {}) {
  const { id } = useUserAuthStore();

  return useAppQuery<
    Awaited<ReturnType<typeof getUserCartCount>>,
    HTTPError,
    GetUserCartCountRes
  >({
    queryKey: userCartQueryKeys.count(id),
    queryFn: getUserCartCount,
    select: (res) => res.data,
    enabled: enabled !== false && !!id,
    persist: true,
  });
}

/**
 * 서버 장바구니를 지금 다시 읽어 캐시에 채운다.
 *
 * 409(재고 부족) 뒤 정정에 쓴다 — 그 순간 옳은 수량과 남은 재고는 서버만 안다. 에러 본문의
 * `available: 1, requested: 2` 를 파싱하지 않고 이쪽을 보는 이유다.
 *
 * `invalidateQueries` 로는 부족하다. 상품상세에는 목록 쿼리를 구독하는 화면이 없어
 * 무효화만으로는 아무도 다시 읽지 않는다.
 */
export function useFetchUserCart() {
  const queryClient = useQueryClient();
  const languageCode = useLanguage();
  const id = useUserAuthStore((state) => state.id);

  return useCallback(
    () =>
      queryClient.fetchQuery({
        queryKey: userCartQueryKeys.list(id, languageCode),
        queryFn: () => getUserCart({ languageCode }),
        // 관찰자 없이 채우는 경로라 meta 를 직접 붙인다. 빠뜨리면 이 쿼리가 저장 대상에서
        // 빠져 새로고침 때 깜박임이 돌아온다.
        meta: { logError: false, persist: true },
      }),
    [queryClient, id, languageCode],
  );
}

/**
 * 수량을 캐시에만 먼저 반영한다.
 *
 * 수량 PATCH 는 400ms 모았다가 보내므로(`useCart`), 낙관적 반영을 mutation 의 `onMutate` 에
 * 두면 스테퍼가 그 시간만큼 굳어 보인다. 그래서 화면 반영과 전송을 떼어 놓았다.
 * 실패 시 되돌리기는 스냅샷 대신 서버 재조회로 한다 — 옳은 값을 아는 쪽은 서버다.
 */
function useSetCartItemQuantity() {
  const queryClient = useQueryClient();
  const keys = useUserCartKeys();

  return useCallback(
    (cartItemId: number, quantity: number) => {
      queryClient.setQueryData<CartListCache>(keys.list, (cache) =>
        cache
          ? {
              ...cache,
              data: {
                ...cache.data,
                brandGroups: cache.data.brandGroups.map((group) => ({
                  ...group,
                  items: group.items.map((item: UserCartItem) =>
                    item.cartItemId === cartItemId
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
    [queryClient, keys.list],
  );
}

/**
 * 담기·수량 변경·삭제는 모두 목록과 뱃지 수를 동시에 흔든다.
 * 개별 무효화를 나열하는 대신 도메인 루트 키 하나로 걷어낸다.
 */
function useInvalidateUserCart() {
  const queryClient = useQueryClient();

  return useCallback(
    () => queryClient.invalidateQueries({ queryKey: userCartQueryKeys.all }),
    [queryClient],
  );
}

interface UserCartMutationArgs {
  /** 실패를 사용자에게 토스트로 알릴지 */
  toastOnError?: boolean;
}

/**
 * @description 장바구니 담기 (단건 · 다건)
 *
 * 담기는 낙관적으로 반영하지 않는다 — 서버가 매기는 `cartItemId` 를 알 수 없어 가짜 라인을
 * 넣으면 그 라인의 수량 변경·삭제가 곧바로 깨진다. 대신 응답이 함께 주는 `totalCount` 로
 * 헤더 뱃지만 즉시 맞춘다.
 */
export function useCreateUserCartItemsMutation({
  toastOnError = true,
}: UserCartMutationArgs = {}) {
  const queryClient = useQueryClient();
  const keys = useUserCartKeys();

  return useAppMutation<
    Awaited<ReturnType<typeof createUserCartItems>>,
    HTTPError,
    CreateUserCartItemsReq
  >({
    mutationFn: createUserCartItems,
    toastOnError,
    logOnError: !toastOnError,
    onSuccess: (res) => {
      queryClient.setQueryData<CartCountCache>(keys.count, {
        result: true,
        data: { count: res.data.totalCount },
      });
      void queryClient.invalidateQueries({ queryKey: keys.list });
    },
  });
}

/**
 * @description 장바구니 수량 변경
 *
 * 화면 반영은 `useSetCartItemQuantity` 가 이미 끝냈다. 여기서는 전송과 사후 정합만 맡는다.
 */
export function useUpdateUserCartItemMutation({
  toastOnError = true,
}: UserCartMutationArgs = {}) {
  const invalidateUserCart = useInvalidateUserCart();

  return useAppMutation<
    Awaited<ReturnType<typeof updateUserCartItem>>,
    HTTPError,
    UpdateUserCartItemReq
  >({
    mutationFn: updateUserCartItem,
    toastOnError,
    logOnError: !toastOnError,
    onSettled: invalidateUserCart,
  });
}

interface CartListRollback {
  previous?: CartListCache;
}

/**
 * @description 장바구니 선택 삭제 / 전체 비우기. ids 를 생략하면 전체를 비운다.
 *
 * 삭제는 즉시 사라져야 하므로 캐시를 먼저 고치고, 실패하면 이전 캐시로 되돌린다.
 */
export function useDeleteUserCartItemsMutation({
  toastOnError = true,
}: UserCartMutationArgs = {}) {
  const queryClient = useQueryClient();
  const keys = useUserCartKeys();
  const invalidateUserCart = useInvalidateUserCart();

  return useAppMutation<
    Awaited<ReturnType<typeof deleteUserCartItems>>,
    HTTPError,
    number[] | undefined,
    CartListRollback
  >({
    mutationFn: deleteUserCartItems,
    toastOnError,
    logOnError: !toastOnError,
    onMutate: async (ids) => {
      // 진행 중인 재조회가 낙관적 값을 덮어쓰지 않게 먼저 멈춘다.
      await queryClient.cancelQueries({ queryKey: keys.list });

      const previous = queryClient.getQueryData<CartListCache>(keys.list);

      if (previous) {
        // ids 생략은 전체 비우기다.
        const next = dropCartItems(
          previous,
          ids ? new Set(ids) : listCacheItemIds(previous),
        );

        queryClient.setQueryData(keys.list, next);
        queryClient.setQueryData<CartCountCache>(keys.count, {
          result: true,
          data: { count: next.data.totalCount },
        });
      }

      return { previous };
    },
    onError: (_error, _variables, context) => {
      const previous = context?.previous;
      if (!previous) return;

      queryClient.setQueryData(keys.list, previous);
      queryClient.setQueryData<CartCountCache>(keys.count, {
        result: true,
        data: { count: previous.data.totalCount },
      });
    },
    onSettled: invalidateUserCart,
  });
}

/**
 * 회원 장바구니 어댑터.
 *
 * 화면은 라인을 `productVariantId` 로 가리키지만 서버는 `cartItemId` 를 요구한다.
 * 그 번역이 이 훅 안에서 끝나고, 밖으로는 새어 나가지 않는다.
 */
export function useMemberCart(): CartApi {
  const queryClient = useQueryClient();
  const keys = useUserCartKeys();

  const { data, isPending, isError, refetch } = useUserCartQuery();
  const fetchUserCart = useFetchUserCart();
  const setItemQuantity = useSetCartItemQuantity();

  // 결과를 호출한 자리에서 처리해야 하므로 promise 로 받는다 — `mutate` 의 호출별 콜백은
  // 관찰자 하나를 공유해 나중 호출이 앞 호출의 콜백을 덮어쓴다.
  const { mutateAsync: createItems } = useCreateUserCartItemsMutation({
    toastOnError: false,
  });
  const { mutateAsync: updateItem } = useUpdateUserCartItemMutation({
    toastOnError: false,
  });
  const { mutate: deleteItems } = useDeleteUserCartItemsMutation();

  // 캐시에서 직접 찾는다. 렌더 시점의 값을 닫아두면 디바운스된 전송이 낡은 id 를 쓴다.
  const toCartItemId = useCallback(
    (productVariantId: number) =>
      queryClient
        .getQueryData<CartListCache>(keys.list)
        ?.data.brandGroups.flatMap((group) => group.items)
        .find((item) => item.productVariantId === productVariantId)
        ?.cartItemId ?? null,
    [queryClient, keys.list],
  );

  return {
    data,
    isPending,
    isError,
    refetch: useCallback(() => void refetch(), [refetch]),
    fetchCart: useCallback(
      () =>
        fetchUserCart()
          .then((res) => res.data)
          .catch(() => null),
      [fetchUserCart],
    ),
    addItems: useCallback(
      async (items) => {
        await createItems({ items: [...items] });
      },
      [createItems],
    ),
    setLineQuantity: useCallback(
      (productVariantId, quantity) => {
        const cartItemId = toCartItemId(productVariantId);
        if (cartItemId == null) return;

        setItemQuantity(cartItemId, quantity);
      },
      [setItemQuantity, toCartItemId],
    ),
    commitQuantity: useCallback(
      async (productVariantId, quantity) => {
        const cartItemId = toCartItemId(productVariantId);
        // 라인이 이미 사라졌다. 보낼 곳이 없으므로 조용히 끝낸다. (의도한 동작 변화:
        // 예전에는 `cartItemId` 를 직접 들고 있어 사라진 라인에도 PATCH 를 보내 서버가
        // 404 로 답했다. 지금은 디바운스가 흘러 보내기 전에 캐시로 다시 확인하므로,
        // 그 사이 삭제됐다면 애초에 보내지 않는다.)
        if (cartItemId == null) return;

        await updateItem({ cartItemId, quantity });
      },
      [toCartItemId, updateItem],
    ),
    removeItems: useCallback(
      (productVariantIds) => {
        const ids = productVariantIds
          .map(toCartItemId)
          .filter((id): id is number => id != null);

        // `deleteUserCartItems()` 를 빈 인자로 부르면 전체 비우기다. 지울 것이 없으면
        // 호출 자체를 하지 않는다.
        if (!ids.length) return;

        deleteItems(ids);
      },
      [deleteItems, toCartItemId],
    ),
    // 화면에 지금 보이는 라인의 id 만 명시해서 보낸다. `deleteItems(undefined)` 는
    // 서버 장바구니 전체를 비우라는 뜻이라, 다른 기기에서 담아 아직 이 화면에 안 보이는
    // 라인이나 이 탭의 5분 staleTime 창이 열린 뒤 다른 곳에서 담긴 라인까지 함께
    // 지워진다 — 되돌리기(undo)는 이 화면이 스냅샷으로 들고 있던 라인만 다시 담으므로
    // 그 라인들은 영영 돌아오지 않는다. 캐시가 아직 없으면(비정상 경로) 지킬 라인도
    // 없으므로 그때만 전체 비우기로 떨어진다.
    removeAll: useCallback(() => {
      const cache = queryClient.getQueryData<CartListCache>(keys.list);

      if (!cache) {
        deleteItems(undefined);
        return;
      }

      const ids = [...listCacheItemIds(cache)];

      // 캐시가 있는데 ids 가 비어 있으면(이미 빈 장바구니) 절대 그대로 보내지 않는다.
      // `deleteUserCartItems([])` 는 검색 파라미터 없는 요청으로 직렬화되고, 서버는 그
      // 모양을 "ids 생략 = 전체 비우기"로 읽는다 — 바로 위에서 명시적 ids 를 쓰기로 한
      // 이유였던 그 데이터 유실 사고(다른 기기에서 담긴 라인까지 삭제)가 빈 배열을 타고
      // 다시 일어난다. 오늘은 `CartList.tsx` 가 `if (!items.length) return;` 로 한 겹
      // 막아 주지만, 그 가드는 엔티티 계약이 아니라 화면 쪽 우연이다.
      if (!ids.length) return;

      deleteItems(ids);
    }, [deleteItems, queryClient, keys.list]),
  };
}
