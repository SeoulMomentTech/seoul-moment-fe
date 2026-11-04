"use client";

import type { HTTPError } from "ky";

import useAppQuery from "@shared/lib/hooks/query/useAppQuery";
import {
  getLogisticsCvsStore,
  type GetLogisticsCvsStoreRes,
} from "@shared/services/logistics";

import { logisticsQueryKeys } from "./queryKey";

/** 매장 토큰 유효 시간. 서버가 1시간 뒤 404 를 주니 그 전엔 다시 묻지 않는다 */
const CVS_STORE_TOKEN_TTL_MS = 1000 * 60 * 60;

/**
 * @description 고른 편의점 매장 조회.
 *
 * 전자지도에서 돌아올 때 받은 `cvsStoreToken` 으로 매장을 읽어 주문서에 보여준다.
 * 404 는 토큰이 만료된 것이라 재시도하지 않는다 — 화면이 다시 고르게 안내한다.
 */
export function useLogisticsCvsStoreQuery(token: string | null) {
  return useAppQuery<
    Awaited<ReturnType<typeof getLogisticsCvsStore>>,
    HTTPError,
    GetLogisticsCvsStoreRes
  >({
    queryKey: logisticsQueryKeys.cvsStore(token),
    queryFn: () => {
      // enabled 가 막고 있어 여기서는 토큰이 반드시 있다
      if (!token) throw new Error("cvs store needs a cvsStoreToken");

      return getLogisticsCvsStore(token);
    },
    select: (res) => res.data,
    enabled: !!token,
    retry: false,
    staleTime: CVS_STORE_TOKEN_TTL_MS,
  });
}
