import type { HTTPError } from "ky";

import { createUserFit, type CreateUserFitReq } from "@shared/services/user";

import useAppMutation from "@/shared/lib/hooks/query/useAppMutation";

import { useQueryClient } from "@tanstack/react-query";

export function useCreateUserFitMutation() {
  const queryClient = useQueryClient();

  return useAppMutation<unknown, HTTPError, CreateUserFitReq>({
    mutationFn: createUserFit,
    toastOnError: true,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "fit"] });
    },
  });
}
