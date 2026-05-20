import type { HTTPError } from "ky";

import { createUserProductLike } from "@shared/services/userLike";

import useAppMutation from "@/shared/lib/hooks/query/useAppMutation";

import { useQueryClient } from "@tanstack/react-query";

export function useCreateUserProductLikeMutation() {
  const queryClient = useQueryClient();

  return useAppMutation<unknown, HTTPError, number>({
    mutationFn: (productItemId) => createUserProductLike({ productItemId }),
    toastOnError: true,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "like", "product"] });
    },
  });
}
