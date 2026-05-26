import type { HTTPError } from "ky";

import { deleteUserProfileImage } from "@shared/services/user";

import useAppMutation from "@/shared/lib/hooks/query/useAppMutation";

import { useQueryClient } from "@tanstack/react-query";

export function useDeleteUserProfileImageMutation() {
  const queryClient = useQueryClient();

  return useAppMutation<unknown, HTTPError, void>({
    mutationFn: deleteUserProfileImage,
    toastOnError: true,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "profile"] });
    },
  });
}
