import type { HTTPError } from "ky";

import {
  createUserProfileImage,
  type CreateUserProfileImageReq,
} from "@shared/services/user";

import useAppMutation from "@/shared/lib/hooks/query/useAppMutation";

import { useQueryClient } from "@tanstack/react-query";

export function useCreateUserProfileImageMutation() {
  const queryClient = useQueryClient();

  return useAppMutation<unknown, HTTPError, CreateUserProfileImageReq>({
    mutationFn: createUserProfileImage,
    toastOnError: true,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "profile"] });
    },
  });
}
