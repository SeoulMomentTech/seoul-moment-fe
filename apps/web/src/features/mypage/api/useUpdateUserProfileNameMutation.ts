import type { HTTPError } from "ky";

import {
  updateUserProfileName,
  type UpdateUserProfileNameReq,
} from "@shared/services/user";

import useAppMutation from "@/shared/lib/hooks/query/useAppMutation";

import { useQueryClient } from "@tanstack/react-query";

export function useUpdateUserProfileNameMutation() {
  const queryClient = useQueryClient();

  return useAppMutation<unknown, HTTPError, UpdateUserProfileNameReq>({
    mutationFn: updateUserProfileName,
    toastOnError: true,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "profile"] });
    },
  });
}
