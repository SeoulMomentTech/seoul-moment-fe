import type { HTTPError } from "ky";

import {
  deleteUserBrandLike,
  type GetUserBrandLikeListRes,
} from "@shared/services/userLike";

import useAppMutation from "@/shared/lib/hooks/query/useAppMutation";

import type { CommonRes } from "@shared/services";
import { type InfiniteData, useQueryClient } from "@tanstack/react-query";

type PageRes = CommonRes<GetUserBrandLikeListRes>;
type BrandLikeInfiniteData = InfiniteData<PageRes>;

const BRAND_LIKE_QUERY_KEY = ["user", "like", "brand"] as const;

interface OptimisticContext {
  snapshots: Array<[readonly unknown[], BrandLikeInfiniteData | undefined]>;
}

export function useDeleteUserBrandLikeMutation() {
  const queryClient = useQueryClient();

  return useAppMutation<unknown, HTTPError, number, OptimisticContext>({
    mutationFn: deleteUserBrandLike,
    toastOnError: true,
    onMutate: async (brandId) => {
      await queryClient.cancelQueries({ queryKey: BRAND_LIKE_QUERY_KEY });

      const snapshots = queryClient.getQueriesData<BrandLikeInfiniteData>({
        queryKey: BRAND_LIKE_QUERY_KEY,
      });

      for (const [key] of snapshots) {
        queryClient.setQueryData<BrandLikeInfiniteData>(key, (prev) => {
          if (!prev) return prev;

          const matchesAny = prev.pages.some((page) =>
            page.data.list.some((brand) => brand.brandId === brandId),
          );

          return {
            ...prev,
            pages: prev.pages.map((page) => ({
              ...page,
              data: {
                ...page.data,
                total: matchesAny
                  ? Math.max(0, page.data.total - 1)
                  : page.data.total,
                list: page.data.list.filter(
                  (brand) => brand.brandId !== brandId,
                ),
              },
            })),
          };
        });
      }

      return { snapshots };
    },
    onError: (_err, _brandId, context) => {
      if (!context) return;
      for (const [key, data] of context.snapshots) {
        queryClient.setQueryData(key, data);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: BRAND_LIKE_QUERY_KEY });
    },
  });
}
