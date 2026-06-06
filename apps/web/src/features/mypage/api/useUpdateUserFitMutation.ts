import type { HTTPError } from "ky";

import { updateUserFit, type UpdateUserFitReq } from "@shared/services/user";

import useAppMutation from "@/shared/lib/hooks/query/useAppMutation";

import { useQueryClient } from "@tanstack/react-query";

export function useUpdateUserFitMutation() {
  const queryClient = useQueryClient();

  return useAppMutation<unknown, HTTPError, UpdateUserFitReq>({
    mutationFn: updateUserFit,
    toastOnError: true,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "fit"] });
    },
  });
}
