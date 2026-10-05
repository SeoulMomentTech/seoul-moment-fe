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
      // 화면에 떠 있는 쿼리만 갱신한다. 캐시된 상세(inactive)까지 다시 받지 않는다.
      .refetchQueries({ queryKey: ["news"], type: "active" })
      .finally(() => setIsRefreshing(false));
  }, [isRefreshing, queryClient]);

  return { isRefreshing, refresh };
};
