import { useCallback, useState } from "react";

import { useQueryClient } from "@tanstack/react-query";

export const useRefreshNews = () => {
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refresh = useCallback(() => {
    // 이미 돌고 있으면 무시한다. 연속으로 당기면 refetch 가 중복 실행된다.
    if (isRefreshing) return;

    setIsRefreshing(true);
    void queryClient
      .refetchQueries({ queryKey: ["news"] })
      .finally(() => setIsRefreshing(false));
  }, [isRefreshing, queryClient]);

  return { isRefreshing, refresh };
};
