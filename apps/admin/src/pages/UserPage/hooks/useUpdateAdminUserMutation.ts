import { useAppMutation } from "@shared/hooks/useAppMutation";
import {
  updateAdminUser,
  type AdminUserId,
  type PatchAdminUserRequest,
} from "@shared/services/user";

import { useQueryClient } from "@tanstack/react-query";

import { USER_QUERY_KEY } from "./queryKeys";

export const useUpdateAdminUserMutation = () => {
  const queryClient = useQueryClient();

  return useAppMutation({
    mutationFn: ({
      userId,
      payload,
    }: {
      userId: AdminUserId;
      payload: PatchAdminUserRequest;
    }) => updateAdminUser(userId, payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEY }),
  });
};
