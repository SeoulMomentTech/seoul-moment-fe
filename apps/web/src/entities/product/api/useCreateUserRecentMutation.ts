import type { HTTPError } from "ky";

import useAppMutation from "@shared/lib/hooks/query/useAppMutation";
import { createUserRecent } from "@shared/services/userRecent";

import { useQueryClient } from "@tanstack/react-query";

export function useCreateUserRecentMutation() {
  const queryClient = useQueryClient();

  return useAppMutation<unknown, HTTPError, number>({
    mutationFn: (productItemId) => createUserRecent({ productItemId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "recent"] });
    },
  });
}
