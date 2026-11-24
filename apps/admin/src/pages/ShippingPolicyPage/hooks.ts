import { useAppMutation } from "@shared/hooks/useAppMutation";
import { useAppQuery } from "@shared/hooks/useAppQuery";
import {
  getAdminShippingPolicy,
  updateAdminShippingPolicy,
} from "@shared/services/shipping";

import { useQueryClient } from "@tanstack/react-query";

const shippingPolicyQueryKey = ["admin", "shipping", "policy"] as const;

export const useAdminShippingPolicyQuery = () =>
  useAppQuery({
    queryKey: shippingPolicyQueryKey,
    queryFn: getAdminShippingPolicy,
    toastOnError: true,
  });

/** PATCH 는 204 라 본문이 없다. 저장 뒤 정책을 다시 불러 화면을 서버 값에 맞춘다 */
export const useUpdateAdminShippingPolicyMutation = () => {
  const queryClient = useQueryClient();

  return useAppMutation({
    mutationFn: updateAdminShippingPolicy,
    toastOnError: "배송비 정책을 저장하지 못했습니다.",
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: shippingPolicyQueryKey }),
  });
};
