import { useUserAuthStore } from "@shared/lib/auth/useUserAuthStore";
import useAppQuery from "@shared/lib/hooks/query/useAppQuery";
import { useLanguage } from "@shared/lib/i18n/useLanguage";
import type { GetUserBrandLikeListRes } from "@shared/services/userLike";
import { getUserBrandLikeList } from "@shared/services/userLike";

import type { CommonRes } from "@shared/services";

import { LIKES_PAGE, LIKES_PAGE_SIZE, USER_BRAND_LIKE_KEY } from "./keys";

/** 관심 브랜드 목록. 상품 쪽과 달리 좁힐 필터가 없다. */
export const useLikedBrands = () => {
  const languageCode = useLanguage();
  const isAuthenticated = useUserAuthStore((s) => s.isAuthenticated);
  const id = useUserAuthStore((s) => s.id);

  return useAppQuery({
    queryKey: [
      ...USER_BRAND_LIKE_KEY,
      id,
      LIKES_PAGE,
      LIKES_PAGE_SIZE,
      languageCode,
    ] as const,
    queryFn: () =>
      getUserBrandLikeList({
        page: LIKES_PAGE,
        count: LIKES_PAGE_SIZE,
        languageCode,
      }),
    select: (
      res: CommonRes<GetUserBrandLikeListRes>,
    ): GetUserBrandLikeListRes => res.data,
    enabled: isAuthenticated,
  });
};
