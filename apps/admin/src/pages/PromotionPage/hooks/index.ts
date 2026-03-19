
import {
  createAdminPromotion,
  deleteAdminPromotion,
  getAdminPromotionDetail,
  getAdminPromotionList,
  updateAdminPromotion,
} from "@shared/services/promotion";
import type {
  GetAdminPromotionListParams,
  PatchAdminPromotionRequest,
  PostAdminPromotionRequest,
} from "@shared/services/promotion";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const promotionKeys = {
  all: ["promotions"] as const,
  lists: () => [...promotionKeys.all, "list"] as const,
  list: (params?: GetAdminPromotionListParams) =>
    [...promotionKeys.lists(), params] as const,
  details: () => [...promotionKeys.all, "detail"] as const,
  detail: (id: number) => [...promotionKeys.details(), id] as const,
};

export const useAdminPromotionListQuery = (params?: GetAdminPromotionListParams) => {
  return useQuery({
    queryKey: promotionKeys.list(params),
    queryFn: () => getAdminPromotionList(params),
  });
};

export const useAdminPromotionDetailQuery = (id: number, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: promotionKeys.detail(id),
    queryFn: () => getAdminPromotionDetail(id),
    enabled: options?.enabled,
  });
};

export const useCreateAdminPromotionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PostAdminPromotionRequest) => createAdminPromotion(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: promotionKeys.lists() });
    },
  });
};

export const useUpdateAdminPromotionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: PatchAdminPromotionRequest }) =>
      updateAdminPromotion(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: promotionKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: promotionKeys.lists() });
    },
  });
};

export const useDeleteAdminPromotionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteAdminPromotion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: promotionKeys.lists() });
    },
  });
};