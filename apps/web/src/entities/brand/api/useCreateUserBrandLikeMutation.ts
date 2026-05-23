import type { HTTPError } from "ky";

import type { GetBrandPromotionResponse } from "@shared/services/brandPromotion";
import type { GetProductBrandBannerRes } from "@shared/services/product";
import { createUserBrandLike } from "@shared/services/userLike";

import useAppMutation from "@/shared/lib/hooks/query/useAppMutation";

import type { CommonRes } from "@shared/services";
import { useQueryClient } from "@tanstack/react-query";

type BrandBannerCache = CommonRes<GetProductBrandBannerRes>;
type BrandPromotionDetailCache = CommonRes<GetBrandPromotionResponse>;

interface OptimisticContext {
  bannerSnapshots: Array<[readonly unknown[], BrandBannerCache | undefined]>;
  promotionSnapshots: Array<
    [readonly unknown[], BrandPromotionDetailCache | undefined]
  >;
}

export function useCreateUserBrandLikeMutation() {
  const queryClient = useQueryClient();

  return useAppMutation<unknown, HTTPError, number, OptimisticContext>({
    mutationFn: (brandId) => createUserBrandLike({ brandId }),
    toastOnError: true,
    onMutate: async (brandId) => {
      const bannerKey = ["productBrandBanner", brandId] as const;
      const promotionKey = ["brandPromotionDetail"] as const;
      await Promise.all([
        queryClient.cancelQueries({ queryKey: bannerKey }),
        queryClient.cancelQueries({ queryKey: promotionKey }),
      ]);

      const bannerSnapshots = queryClient.getQueriesData<BrandBannerCache>({
        queryKey: bannerKey,
      });
      const promotionSnapshots =
        queryClient.getQueriesData<BrandPromotionDetailCache>({
          queryKey: promotionKey,
        });

      for (const [key] of bannerSnapshots) {
        queryClient.setQueryData<BrandBannerCache>(key, (prev) =>
          prev
            ? { ...prev, data: { ...prev.data, like: prev.data.like + 1 } }
            : prev,
        );
      }

      for (const [key, value] of promotionSnapshots) {
        if (!value?.data?.brand || value.data.brand.id !== brandId) continue;
        queryClient.setQueryData<BrandPromotionDetailCache>(key, (prev) =>
          prev
            ? {
                ...prev,
                data: {
                  ...prev.data,
                  brand: {
                    ...prev.data.brand,
                    isLiked: true,
                    likeCount: prev.data.brand.likeCount + 1,
                  },
                },
              }
            : prev,
        );
      }

      return { bannerSnapshots, promotionSnapshots };
    },
    onError: (_err, _brandId, context) => {
      if (!context) return;
      for (const [key, data] of context.bannerSnapshots) {
        queryClient.setQueryData(key, data);
      }
      for (const [key, data] of context.promotionSnapshots) {
        queryClient.setQueryData(key, data);
      }
    },
    onSettled: (_data, _err, brandId) => {
      queryClient.invalidateQueries({ queryKey: ["user", "like", "brand"] });
      queryClient.invalidateQueries({
        queryKey: ["productBrandBanner", brandId],
      });
      queryClient.invalidateQueries({ queryKey: ["brandPromotionDetail"] });
    },
  });
}
