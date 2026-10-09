import type { UserProductLike } from "@shared/services/userLike";
import { deleteUserProductLike } from "@shared/services/userLike";

import { USER_PRODUCT_LIKE_KEY } from "./keys";
import { useOptimisticUnlike } from "./useOptimisticUnlike";

/** 관심 상품 해제. 누르는 즉시 줄이 빠지고, 실패하면 되돌아온다. */
export const useUnlikeProduct = () =>
  useOptimisticUnlike<UserProductLike>({
    rootKey: USER_PRODUCT_LIKE_KEY,
    mutationFn: deleteUserProductLike,
    isTarget: (item, id) => item.productItemId === id,
  });
