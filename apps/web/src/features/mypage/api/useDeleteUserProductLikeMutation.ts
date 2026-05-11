import type { HTTPError } from "ky";

import { deleteUserProductLike } from "@shared/services/userLike";

import useAppMutation from "@/shared/lib/hooks/query/useAppMutation";

import { useQueryClient } from "@tanstack/react-query";

export function useDeleteUserProductLikeMutation() {
  const queryClient = useQueryClient();

  return useAppMutation<unknown, HTTPError, number>({
    mutationFn: deleteUserProductLike,
    toastOnError: true,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "like", "product"] });
    },
  });
}
