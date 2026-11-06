"use client";

import type { HTTPError } from "ky";

import { useLanguage } from "@shared/lib/hooks";
import useAppMutation from "@shared/lib/hooks/query/useAppMutation";
import useAppQuery from "@shared/lib/hooks/query/useAppQuery";
import { useUserAuthStore } from "@shared/lib/hooks/useUserAuthStore";
import {
  createUserOrder,
  getUserOrderDetail,
  postUserOrderPayment,
  type CreateUserOrderReq,
  type GetUserOrderDetailRes,
} from "@shared/services/userOrder";

import { orderQueryKeys } from "./queryKey";

/**
 * 유니온에 `Omit` 을 바로 걸면 공통 키만 남아 HOME/CVS 분기가 사라진다.
 * 분기마다 따로 걷어내 스웨거의 "둘 중 하나" 규칙을 지킨다.
 */
type DistributiveOmit<T, K extends PropertyKey> = T extends unknown
  ? Omit<T, K>
  : never;

/** 언어는 훅이 채우므로 호출부는 주문 내용만 넘긴다 */
export type CreateUserOrderVariables = DistributiveOmit<
  CreateUserOrderReq,
  "languageCode"
>;

interface UserOrderQueryArgs {
  enabled?: boolean;
  /** 결제 결과를 기다리는 화면이 주기적으로 다시 읽을 때 (ms). 기본은 폴링 없음 */
  refetchInterval?: number | false;
}

interface UserOrderMutationArgs {
  /** 실패를 사용자에게 토스트로 알릴지 */
  toastOnError?: boolean;
}

/**
 * @description 주문 상세 조회. 로그인 전이거나 orderId 가 없으면 부르지 않는다.
 */
export function useUserOrderDetailQuery(
  orderId: number | null,
  { enabled, refetchInterval = false }: UserOrderQueryArgs = {},
) {
  const id = useUserAuthStore((state) => state.id);

  return useAppQuery<
    Awaited<ReturnType<typeof getUserOrderDetail>>,
    HTTPError,
    GetUserOrderDetailRes
  >({
    queryKey: orderQueryKeys.detail(id, orderId),
    queryFn: () => {
      // enabled 가 막고 있어 여기서는 orderId 가 반드시 있다
      if (orderId === null) throw new Error("order detail needs an orderId");

      return getUserOrderDetail(orderId);
    },
    select: (res) => res.data,
    enabled: enabled !== false && orderId !== null && !!id,
    refetchInterval,
  });
}

/**
 * @description 주문 생성 (결제하기 직전).
 *
 * PENDING 으로 만들 뿐 재고도 장바구니도 건드리지 않으므로 여기서 무효화할 캐시가 없다.
 * 장바구니는 결제 성공 뒤 서버가 비우니 결제 결과 화면에서 걷어낸다.
 */
export function useCreateUserOrderMutation({
  toastOnError = true,
}: UserOrderMutationArgs = {}) {
  const languageCode = useLanguage();

  return useAppMutation<
    Awaited<ReturnType<typeof createUserOrder>>,
    HTTPError,
    CreateUserOrderVariables
  >({
    // 분기별 Omit 에 languageCode 를 되돌려 붙이면 TS 가 유니온을 다시 못 좁혀 단언한다.
    mutationFn: (variables) =>
      createUserOrder({ ...variables, languageCode } as CreateUserOrderReq),
    toastOnError,
    logOnError: !toastOnError,
  });
}

/**
 * @description 결제 시작 (주문 생성 직후 · 결제창 이탈 후 다시 결제).
 *
 * 성공하면 응답의 URL 로 브라우저를 보내야 하므로 호출부가 `onSuccess` 로 이어 붙인다.
 * 409 는 결제 불가 상태이거나 재고 부족(`data.productVariantIds`)이라 토스트 대신 화면이
 * 직접 풀어야 할 때가 많다 — 그럴 땐 `toastOnError: false` 로 끈다.
 */
export function useUserOrderPaymentMutation({
  toastOnError = true,
}: UserOrderMutationArgs = {}) {
  const languageCode = useLanguage();

  return useAppMutation<
    Awaited<ReturnType<typeof postUserOrderPayment>>,
    HTTPError,
    number
  >({
    mutationFn: (orderId) => postUserOrderPayment({ orderId, languageCode }),
    toastOnError,
    logOnError: !toastOnError,
  });
}
