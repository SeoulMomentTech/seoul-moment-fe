import type { HTTPError } from "ky";

import {
  createUserProfile,
  type CreateUserProfileReq,
} from "@shared/services/user";

import useAppMutation from "@/shared/lib/hooks/query/useAppMutation";

import { useQueryClient } from "@tanstack/react-query";

export function useCreateUserProfileMutation() {
  const queryClient = useQueryClient();

  return useAppMutation<unknown, HTTPError, CreateUserProfileReq>({
    mutationFn: createUserProfile,
    toastOnError: true,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "profile"] });
    },
  });
}
