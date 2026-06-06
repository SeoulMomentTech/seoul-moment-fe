import type { HTTPError } from "ky";

import { deleteUserFit } from "@shared/services/user";

import useAppMutation from "@/shared/lib/hooks/query/useAppMutation";

import { useQueryClient } from "@tanstack/react-query";

export function useDeleteUserFitMutation() {
  const queryClient = useQueryClient();

  return useAppMutation<unknown, HTTPError, void>({
    mutationFn: deleteUserFit,
    toastOnError: true,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "fit"] });
    },
  });
}
