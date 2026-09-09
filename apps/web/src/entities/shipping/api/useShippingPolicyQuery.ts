import useAppQuery from "@shared/lib/hooks/query/useAppQuery";
import {
  getShippingPolicy,
  type GetShippingPolicyRes,
} from "@shared/services/shipping";

/**
 * 배송비 요율표. 언어·사용자와 무관한 전역 값이고 자주 바뀌지 않아
 * 기본 staleTime(5분)보다 길게 잡아 화면마다 재조회하지 않게 한다.
 */
export function useShippingPolicyQuery() {
  return useAppQuery<
    Awaited<ReturnType<typeof getShippingPolicy>>,
    Error,
    GetShippingPolicyRes
  >({
    queryKey: ["shipping-policy"],
    queryFn: getShippingPolicy,
    select: (res) => res.data,
    staleTime: 1000 * 60 * 60,
  });
}
