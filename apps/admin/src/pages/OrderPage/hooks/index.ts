import { useAppMutation } from "@shared/hooks/useAppMutation";
import { useAppQuery } from "@shared/hooks/useAppQuery";
import {
  createAdminOrderPurchase,
  deleteAdminOrderCancelRequest,
  getAdminOrderDetail,
  getAdminOrderList,
  getAdminOrderSummary,
  updateAdminOrderDeliveryStage,
  updateAdminOrderLocalDelivery,
  type AdminOrderId,
  type GetAdminOrderListParams,
  type PatchAdminOrderLocalDeliveryRequest,
  type PostAdminOrderDeliveryStageRequest,
  type PostAdminOrderPurchaseRequest,
} from "@shared/services/order";
import {
  completeAdminOrderRefund,
  createAdminOrderRefund,
  deleteAdminOrderRefund,
  retryAdminOrderInvoiceAdjustment,
  type PostAdminOrderRefundCompleteRequest,
  type PostAdminOrderRefundRequest,
} from "@shared/services/refund";

import { useQueryClient } from "@tanstack/react-query";

import { ORDER_SUMMARY_REFETCH_MS } from "../constants";
import { ORDER_QUERY_KEY, orderQueryKeys } from "./queryKeys";

export { orderQueryKeys } from "./queryKeys";

export const useAdminOrderListQuery = (params: GetAdminOrderListParams) =>
  useAppQuery({
    queryKey: orderQueryKeys.list(params),
    queryFn: () => getAdminOrderList(params),
    placeholderData: (previous) => previous,
    toastOnError: true,
  });

/** 목록 필터와 무관한 전체 집계. 1분 간격으로 다시 부른다 */
export const useAdminOrderSummaryQuery = () =>
  useAppQuery({
    queryKey: orderQueryKeys.summary(),
    queryFn: getAdminOrderSummary,
    refetchInterval: ORDER_SUMMARY_REFETCH_MS,
  });

/** 드로어를 열 때 1회. 탭을 바꿔도 다시 부르지 않는다 — 한 응답에 주문·발주·타이머가 같이 온다 */
export const useAdminOrderDetailQuery = (orderId: AdminOrderId | null) =>
  useAppQuery({
    queryKey: orderQueryKeys.detail(orderId as AdminOrderId),
    queryFn: () => getAdminOrderDetail(orderId as AdminOrderId),
    enabled: orderId !== null,
    toastOnError: true,
  });

/**
 * 한국 발주 시작. 204 라 본문이 없으므로 성공하면 상세·목록·KPI 를 다시 불러
 * purchaseStatus·deliveryStage 를 반영한다.
 */
export const useAdminOrderPurchaseMutation = () => {
  const queryClient = useQueryClient();

  return useAppMutation({
    mutationFn: ({
      orderId,
      payload,
    }: {
      orderId: AdminOrderId;
      payload: PostAdminOrderPurchaseRequest;
    }) => createAdminOrderPurchase(orderId, payload),
    onSettled: () =>
      // 409(다른 관리자가 먼저 발주 등)여도 최신 상태를 보여줘야 하므로 성공·실패 모두 갱신한다
      queryClient.invalidateQueries({ queryKey: ORDER_QUERY_KEY }),
  });
};

/**
 * 주문 상태를 바꾸는 작업은 대부분 204 라 본문이 없다. 409(다른 관리자가 먼저 바꿈 등)여도
 * 최신 상태를 보여줘야 하므로 성공·실패 모두 상세·목록·KPI 를 다시 부른다.
 */
const useOrderActionMutation = <TVariables, TData>(
  mutationFn: (variables: TVariables) => Promise<TData>,
) => {
  const queryClient = useQueryClient();

  return useAppMutation({
    mutationFn,
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: ORDER_QUERY_KEY }),
  });
};

/** 배송 단계 변경. 드로어에서도 orderIds: [id] 로 보낸다 */
export const useAdminOrderDeliveryStageMutation = () =>
  useOrderActionMutation((payload: PostAdminOrderDeliveryStageRequest) =>
    updateAdminOrderDeliveryStage(payload),
  );

/** 대만 국내운송사·운송장 입력. 배송 단계는 바뀌지 않는다 */
export const useAdminOrderLocalDeliveryMutation = () =>
  useOrderActionMutation(
    ({
      orderId,
      payload,
    }: {
      orderId: AdminOrderId;
      payload: PatchAdminOrderLocalDeliveryRequest;
    }) => updateAdminOrderLocalDelivery(orderId, payload),
  );

/** 취소·계약해제 접수 철회 */
export const useAdminOrderCancelWithdrawMutation = () =>
  useOrderActionMutation((orderId: AdminOrderId) =>
    deleteAdminOrderCancelRequest(orderId),
  );

/** 환불 실행 · 재시도 (super_admin) */
export const useAdminOrderRefundMutation = () =>
  useOrderActionMutation(
    ({
      orderId,
      payload,
    }: {
      orderId: AdminOrderId;
      payload: PostAdminOrderRefundRequest;
    }) => createAdminOrderRefund(orderId, payload),
  );

/** 끝나지 않은 환불 요청 취소 (super_admin) */
export const useAdminOrderRefundCancelMutation = () =>
  useOrderActionMutation((orderId: AdminOrderId) =>
    deleteAdminOrderRefund(orderId),
  );

/** 수동 환불 완료 입력 (super_admin) */
export const useAdminOrderRefundCompleteMutation = () =>
  useOrderActionMutation(
    ({
      orderId,
      payload,
    }: {
      orderId: AdminOrderId;
      payload: PostAdminOrderRefundCompleteRequest;
    }) => completeAdminOrderRefund(orderId, payload),
  );

/** 전자발표 정정 재시도 (super_admin) */
export const useAdminOrderInvoiceAdjustMutation = () =>
  useOrderActionMutation((orderId: AdminOrderId) =>
    retryAdminOrderInvoiceAdjustment(orderId),
  );
