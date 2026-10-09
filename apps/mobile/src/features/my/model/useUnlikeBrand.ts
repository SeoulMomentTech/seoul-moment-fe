import type { UserBrandLike } from "@shared/services/userLike";
import { deleteUserBrandLike } from "@shared/services/userLike";

import { USER_BRAND_LIKE_KEY } from "./keys";
import { useOptimisticUnlike } from "./useOptimisticUnlike";

/** 관심 브랜드 해제. 상품 쪽과 같은 방식이다. */
export const useUnlikeBrand = () =>
  useOptimisticUnlike<UserBrandLike>({
    rootKey: USER_BRAND_LIKE_KEY,
    mutationFn: deleteUserBrandLike,
    isTarget: (item, id) => item.brandId === id,
  });
