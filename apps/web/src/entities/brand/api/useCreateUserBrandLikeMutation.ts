import type { HTTPError } from "ky";

import type { GetProductBrandBannerRes } from "@shared/services/product";
import { createUserBrandLike } from "@shared/services/userLike";

import useAppMutation from "@/shared/lib/hooks/query/useAppMutation";

import type { CommonRes } from "@shared/services";
import { useQueryClient } from "@tanstack/react-query";

type BrandBannerCache = CommonRes<GetProductBrandBannerRes>;

interface OptimisticContext {
  snapshots: Array<[readonly unknown[], BrandBannerCache | undefined]>;
}

export function useCreateUserBrandLikeMutation() {
  const queryClient = useQueryClient();

  return useAppMutation<unknown, HTTPError, number, OptimisticContext>({
    mutationFn: (brandId) => createUserBrandLike({ brandId }),
    toastOnError: true,
    onMutate: async (brandId) => {
      const bannerKey = ["productBrandBanner", brandId] as const;
      await queryClient.cancelQueries({ queryKey: bannerKey });

      const snapshots = queryClient.getQueriesData<BrandBannerCache>({
        queryKey: bannerKey,
      });

      for (const [key] of snapshots) {
        queryClient.setQueryData<BrandBannerCache>(key, (prev) =>
          prev
            ? { ...prev, data: { ...prev.data, like: prev.data.like + 1 } }
            : prev,
        );
      }

      return { snapshots };
    },
    onError: (_err, _brandId, context) => {
      if (!context) return;
      for (const [key, data] of context.snapshots) {
        queryClient.setQueryData(key, data);
      }
    },
    onSettled: (_data, _err, brandId) => {
      queryClient.invalidateQueries({ queryKey: ["user", "like", "brand"] });
      queryClient.invalidateQueries({
        queryKey: ["productBrandBanner", brandId],
      });
    },
  });
}
