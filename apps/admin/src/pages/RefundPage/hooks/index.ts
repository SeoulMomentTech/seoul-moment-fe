import { ORDER_QUERY_KEY } from "@pages/OrderPage/hooks/queryKeys";
import { useAppQuery } from "@shared/hooks/useAppQuery";
import {
  getAdminRefundList,
  type GetAdminRefundListParams,
} from "@shared/services/refund";

/**
 * 환불은 주문에 딸린 작업이라 키를 주문 키 아래에 둔다. 환불·정정 작업은 주문 쪽 뮤테이션이
 * 주문 키 전체를 무효화하므로, 행 버튼이나 주문 드로어에서 처리해도 이 목록이 함께 갱신된다.
 */
export const refundQueryKeys = {
  list: (params?: GetAdminRefundListParams) =>
    [...ORDER_QUERY_KEY, "refund-list", params] as const,
};

export const useAdminRefundListQuery = (params: GetAdminRefundListParams) =>
  useAppQuery({
    queryKey: refundQueryKeys.list(params),
    queryFn: () => getAdminRefundList(params),
    placeholderData: (previous) => previous,
    toastOnError: true,
  });
