import { useCallback } from "react";

import type { HTTPError } from "ky";

import { useLanguage } from "@shared/lib/hooks";
import useAppMutation from "@shared/lib/hooks/query/useAppMutation";
import useAppQuery from "@shared/lib/hooks/query/useAppQuery";
import { useUserAuthStore } from "@shared/lib/hooks/useUserAuthStore";
import {
  createUserCartItem,
  deleteUserCartItem,
  deleteUserCartItems,
  getUserCart,
  getUserCartCount,
  updateUserCartItem,
  type CreateUserCartItemReq,
  type GetUserCartCountRes,
  type GetUserCartRes,
  type UpdateUserCartItemReq,
} from "@shared/services/userCart";

import { useQueryClient } from "@tanstack/react-query";

import { userCartQueryKeys } from "./queryKey";

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
      }),
    [queryClient, id, languageCode],
  );
}

/**
 * 담기·수량 변경·삭제는 모두 목록과 뱃지 수를 동시에 흔든다.
 * 개별 무효화를 나열하는 대신 도메인 루트 키 하나로 걷어낸다.
 */
function useInvalidateUserCart() {
  const queryClient = useQueryClient();

  return () =>
    queryClient.invalidateQueries({ queryKey: userCartQueryKeys.all });
}

interface UserCartMutationArgs {
  /**
   * 실패를 사용자에게 토스트로 알릴지. 로컬 카트와 병행 기록하는 전환기에는
   * 화면상 조작이 이미 성공했으므로 끄고 Sentry 로만 남긴다.
   */
  toastOnError?: boolean;
}

/**
 * @description 장바구니 담기
 */
export function useCreateUserCartItemMutation({
  toastOnError = true,
}: UserCartMutationArgs = {}) {
  const invalidateUserCart = useInvalidateUserCart();

  return useAppMutation<
    Awaited<ReturnType<typeof createUserCartItem>>,
    HTTPError,
    CreateUserCartItemReq
  >({
    mutationFn: createUserCartItem,
    toastOnError,
    logOnError: !toastOnError,
    onSuccess: invalidateUserCart,
  });
}

/**
 * @description 장바구니 수량 변경
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
    onSuccess: invalidateUserCart,
  });
}

/**
 * @description 장바구니 라인 삭제
 */
export function useDeleteUserCartItemMutation() {
  const invalidateUserCart = useInvalidateUserCart();

  return useAppMutation<
    Awaited<ReturnType<typeof deleteUserCartItem>>,
    HTTPError,
    number
  >({
    mutationFn: deleteUserCartItem,
    toastOnError: true,
    onSuccess: invalidateUserCart,
  });
}

/**
 * @description 장바구니 선택 삭제 / 전체 비우기. ids 를 생략하면 전체를 비운다.
 */
export function useDeleteUserCartItemsMutation({
  toastOnError = true,
}: UserCartMutationArgs = {}) {
  const invalidateUserCart = useInvalidateUserCart();

  return useAppMutation<
    Awaited<ReturnType<typeof deleteUserCartItems>>,
    HTTPError,
    number[] | undefined
  >({
    mutationFn: deleteUserCartItems,
    toastOnError,
    logOnError: !toastOnError,
    onSuccess: invalidateUserCart,
  });
}
