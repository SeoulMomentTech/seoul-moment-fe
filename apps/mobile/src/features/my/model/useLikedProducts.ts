import { useUserAuthStore } from "@shared/lib/auth/useUserAuthStore";
import useAppQuery from "@shared/lib/hooks/query/useAppQuery";
import { useLanguage } from "@shared/lib/i18n/useLanguage";
import type { GetUserProductLikeListRes } from "@shared/services/userLike";
import { getUserProductLikeList } from "@shared/services/userLike";

import type { CommonRes } from "@shared/services";

import { LIKES_PAGE, LIKES_PAGE_SIZE, USER_PRODUCT_LIKE_KEY } from "./keys";

/**
 * 관심 상품 목록. productCategoryId 는 칩 줄이 고른 상품 카테고리다 — product/category 의
 * id 이지 최상위 categoryId 가 아니다.
 *
 * 키에는 요청이 읽는 값이 전부 들어간다(페이지·개수·필터·언어·계정). 상수인 페이지와
 * 개수까지 넣는 것은, 나중에 그 둘이 변수가 되는 날 키를 고치는 것을 잊지 않게 하기 위해서다.
 */
export const useLikedProducts = (productCategoryId?: number) => {
  const languageCode = useLanguage();
  const isAuthenticated = useUserAuthStore((s) => s.isAuthenticated);
  const id = useUserAuthStore((s) => s.id);

  return useAppQuery({
    queryKey: [
      ...USER_PRODUCT_LIKE_KEY,
      id,
      LIKES_PAGE,
      LIKES_PAGE_SIZE,
      productCategoryId ?? "all",
      languageCode,
    ] as const,
    queryFn: () =>
      getUserProductLikeList({
        page: LIKES_PAGE,
        count: LIKES_PAGE_SIZE,
        productCategoryId,
        languageCode,
      }),
    select: (
      res: CommonRes<GetUserProductLikeListRes>,
    ): GetUserProductLikeListRes => res.data,
    enabled: isAuthenticated,
  });
};
