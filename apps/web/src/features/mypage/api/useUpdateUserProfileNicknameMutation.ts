import type { HTTPError } from "ky";

import {
  updateUserProfileNickname,
  type UpdateUserProfileNicknameReq,
} from "@shared/services/user";

import useAppMutation from "@/shared/lib/hooks/query/useAppMutation";

import { useQueryClient } from "@tanstack/react-query";

export function useUpdateUserProfileNicknameMutation() {
  const queryClient = useQueryClient();

  return useAppMutation<unknown, HTTPError, UpdateUserProfileNicknameReq>({
    mutationFn: updateUserProfileNickname,
    toastOnError: true,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "profile"] });
    },
  });
}
