"use client";

import type { HTTPError } from "ky";

import useAppQuery from "@shared/lib/hooks/query/useAppQuery";
import {
  getPaymentResult,
  type GetPaymentResultRes,
} from "@shared/services/payment";
import type { UserPaymentStatus } from "@shared/services/userOrder";

import { paymentQueryKeys } from "./queryKey";

/** 결제 결과가 아직 안 왔을 때 다시 묻는 간격 */
const PAYMENT_RESULT_POLL_MS = 3000;

/** PG 의 서버 통지가 브라우저 복귀보다 늦을 수 있는 상태 */
const isAwaitingPgResult = (status: UserPaymentStatus | undefined) =>
  status === "REQUESTED" || status === "READY";

/**
 * @description 결제 결과 조회 (로그인 없이).
 *
 * 결제창에서 돌아온 `?h=` 토큰으로 부른다. `payment.status` 가 `REQUESTED`·`READY` 면 PG
 * 결과가 아직 안 온 것이라 몇 초 간격으로 다시 묻고, 상태가 정해지면 폴링을 멈춘다.
 * 404 는 토큰이 7일 지나 만료된 것이라 재시도하지 않는다.
 */
export function usePaymentResultQuery(token: string | null) {
  return useAppQuery<
    Awaited<ReturnType<typeof getPaymentResult>>,
    HTTPError,
    GetPaymentResultRes
  >({
    queryKey: paymentQueryKeys.result(token),
    queryFn: () => {
      // enabled 가 막고 있어 여기서는 토큰이 반드시 있다
      if (!token) throw new Error("payment result needs a token");

      return getPaymentResult(token);
    },
    select: (res) => res.data,
    enabled: !!token,
    retry: false,
    staleTime: 0,
    refetchInterval: (query) =>
      isAwaitingPgResult(query.state.data?.data.payment.status)
        ? PAYMENT_RESULT_POLL_MS
        : false,
  });
}
