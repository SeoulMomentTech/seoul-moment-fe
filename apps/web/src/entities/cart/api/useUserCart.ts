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
 * 담기·수량 변경·삭제는 모두 목록과 뱃지 수를 동시에 흔든다.
 * 개별 무효화를 나열하는 대신 도메인 루트 키 하나로 걷어낸다.
 */
function useInvalidateUserCart() {
  const queryClient = useQueryClient();

  return () =>
    queryClient.invalidateQueries({ queryKey: userCartQueryKeys.all });
}

/**
 * @description 장바구니 담기
 */
export function useCreateUserCartItemMutation() {
  const invalidateUserCart = useInvalidateUserCart();

  return useAppMutation<
    Awaited<ReturnType<typeof createUserCartItem>>,
    HTTPError,
    CreateUserCartItemReq
  >({
    mutationFn: createUserCartItem,
    toastOnError: true,
    onSuccess: invalidateUserCart,
  });
}

/**
 * @description 장바구니 수량 변경
 */
export function useUpdateUserCartItemMutation() {
  const invalidateUserCart = useInvalidateUserCart();

  return useAppMutation<
    Awaited<ReturnType<typeof updateUserCartItem>>,
    HTTPError,
    UpdateUserCartItemReq
  >({
    mutationFn: updateUserCartItem,
    toastOnError: true,
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
export function useDeleteUserCartItemsMutation() {
  const invalidateUserCart = useInvalidateUserCart();

  return useAppMutation<
    Awaited<ReturnType<typeof deleteUserCartItems>>,
    HTTPError,
    number[] | undefined
  >({
    mutationFn: deleteUserCartItems,
    toastOnError: true,
    onSuccess: invalidateUserCart,
  });
}
