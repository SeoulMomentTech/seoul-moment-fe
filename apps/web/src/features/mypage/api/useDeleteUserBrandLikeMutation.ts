import type { HTTPError } from "ky";

import { deleteUserBrandLike } from "@shared/services/userLike";

import useAppMutation from "@/shared/lib/hooks/query/useAppMutation";

import { useQueryClient } from "@tanstack/react-query";

export function useDeleteUserBrandLikeMutation() {
  const queryClient = useQueryClient();

  return useAppMutation<unknown, HTTPError, number>({
    mutationFn: deleteUserBrandLike,
    toastOnError: true,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "like", "brand"] });
    },
  });
}
