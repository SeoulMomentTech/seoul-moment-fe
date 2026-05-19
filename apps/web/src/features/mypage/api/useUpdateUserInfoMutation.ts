import type { HTTPError } from "ky";

import { updateUserInfo, type UpdateUserInfoReq } from "@shared/services/user";

import useAppMutation from "@/shared/lib/hooks/query/useAppMutation";

import { useQueryClient } from "@tanstack/react-query";

export function useUpdateUserInfoMutation() {
  const queryClient = useQueryClient();

  return useAppMutation<unknown, HTTPError, UpdateUserInfoReq>({
    mutationFn: updateUserInfo,
    toastOnError: true,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "info"] });
    },
  });
}
