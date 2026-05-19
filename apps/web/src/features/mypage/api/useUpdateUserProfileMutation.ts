import type { HTTPError } from "ky";

import {
  updateUserProfile,
  type UpdateUserProfileReq,
} from "@shared/services/user";

import useAppMutation from "@/shared/lib/hooks/query/useAppMutation";

import { useQueryClient } from "@tanstack/react-query";

export function useUpdateUserProfileMutation() {
  const queryClient = useQueryClient();

  return useAppMutation<unknown, HTTPError, UpdateUserProfileReq>({
    mutationFn: updateUserProfile,
    toastOnError: true,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "profile"] });
    },
  });
}
