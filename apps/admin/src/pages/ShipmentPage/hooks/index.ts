import { ORDER_QUERY_KEY } from "@pages/OrderPage/hooks/queryKeys";
import { useAppMutation } from "@shared/hooks/useAppMutation";
import { useAppQuery } from "@shared/hooks/useAppQuery";
import {
  createAdminShipment,
  deleteAdminShipment,
  getAdminShipmentList,
  updateAdminShipment,
  type AdminShipmentId,
  type GetAdminShipmentListParams,
  type PatchAdminShipmentRequest,
  type PostAdminShipmentRequest,
} from "@shared/services/shipment";

import { useQueryClient } from "@tanstack/react-query";

import { SHIPMENT_QUERY_KEY, shipmentQueryKeys } from "./queryKeys";

export const useAdminShipmentListQuery = (params: GetAdminShipmentListParams) =>
  useAppQuery({
    queryKey: shipmentQueryKeys.list(params),
    queryFn: () => getAdminShipmentList(params),
    placeholderData: (previous) => previous,
    toastOnError: true,
  });

/**
 * 묶음을 저장하면 실린 주문의 통관·배송 탭과 작업 이력도 바뀌므로 주문 쪽도 다시 부른다.
 */
const useInvalidateShipment = () => {
  const queryClient = useQueryClient();

  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: SHIPMENT_QUERY_KEY }),
      queryClient.invalidateQueries({ queryKey: ORDER_QUERY_KEY }),
    ]);
};

export const useCreateAdminShipmentMutation = () => {
  const invalidate = useInvalidateShipment();

  return useAppMutation({
    mutationFn: (payload: PostAdminShipmentRequest) =>
      createAdminShipment(payload),
    onSuccess: invalidate,
  });
};

export const useUpdateAdminShipmentMutation = () => {
  const invalidate = useInvalidateShipment();

  return useAppMutation({
    mutationFn: ({
      shipmentId,
      payload,
    }: {
      shipmentId: AdminShipmentId;
      payload: PatchAdminShipmentRequest;
    }) => updateAdminShipment(shipmentId, payload),
    onSuccess: invalidate,
  });
};

export const useDeleteAdminShipmentMutation = () => {
  const invalidate = useInvalidateShipment();

  return useAppMutation({
    mutationFn: (shipmentId: AdminShipmentId) =>
      deleteAdminShipment(shipmentId),
    onSuccess: invalidate,
  });
};
