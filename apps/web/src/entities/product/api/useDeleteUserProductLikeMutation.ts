import type { HTTPError } from "ky";

import type { GetProductDetailRes } from "@shared/services/product";
import { deleteUserProductLike } from "@shared/services/userLike";

import useAppMutation from "@/shared/lib/hooks/query/useAppMutation";

import type { CommonRes } from "@shared/services";
import { useQueryClient } from "@tanstack/react-query";

type ProductDetailCache = CommonRes<GetProductDetailRes>;

interface OptimisticContext {
  snapshots: Array<[readonly unknown[], ProductDetailCache | undefined]>;
}

export function useDeleteUserProductLikeMutation() {
  const queryClient = useQueryClient();

  return useAppMutation<unknown, HTTPError, number, OptimisticContext>({
    mutationFn: deleteUserProductLike,
    toastOnError: true,
    onMutate: async (productItemId) => {
      const detailKey = ["product-detail", productItemId] as const;
      await queryClient.cancelQueries({ queryKey: detailKey });

      const snapshots = queryClient.getQueriesData<ProductDetailCache>({
        queryKey: detailKey,
      });

      for (const [key] of snapshots) {
        queryClient.setQueryData<ProductDetailCache>(key, (prev) =>
          prev
            ? {
                ...prev,
                data: {
                  ...prev.data,
                  like: Math.max(0, prev.data.like - 1),
                },
              }
            : prev,
        );
      }

      return { snapshots };
    },
    onError: (_err, _productItemId, context) => {
      if (!context) return;
      for (const [key, data] of context.snapshots) {
        queryClient.setQueryData(key, data);
      }
    },
    onSettled: (_data, _err, productItemId) => {
      queryClient.invalidateQueries({ queryKey: ["user", "like", "product"] });
      queryClient.invalidateQueries({
        queryKey: ["product-detail", productItemId],
      });
    },
  });
}
