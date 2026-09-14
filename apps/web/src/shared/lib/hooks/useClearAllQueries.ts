import { useCallback } from "react";

import { useQueryClient } from "@tanstack/react-query";

import { queryPersister } from "../query/persister";

const useClearAllQueries = () => {
  const queryClient = useQueryClient();

  const clearAllQueries = useCallback(() => {
    queryClient.removeQueries({ queryKey: ["products"] });
    queryClient.removeQueries({ queryKey: ["product-detail"] });
    queryClient.removeQueries({ queryKey: ["productBrandBanner"] });
    queryClient.removeQueries({ queryKey: ["brandPromotionDetail"] });
    // 장바구니는 계정에 매인 데이터다. 캐시뿐 아니라 localStorage 사본까지 지운다 —
    // 남겨두면 로그아웃한 브라우저에 이전 사용자의 장바구니가 그대로 남는다.
    queryClient.removeQueries({ queryKey: ["user", "cart"] });
    void queryPersister.removeClient();
  }, [queryClient]);

  return { clearAllQueries };
};

export default useClearAllQueries;
