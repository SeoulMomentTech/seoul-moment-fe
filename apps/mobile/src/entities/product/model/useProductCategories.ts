import useAppQuery from "@shared/lib/hooks/query/useAppQuery";
import { useLanguage } from "@shared/lib/i18n/useLanguage";
import type { GetProductCategoryRes } from "@shared/services/product";
import { getProductCategory } from "@shared/services/product";

import type { CommonRes } from "@shared/services";

/**
 * 상품 카테고리. 여기 id 는 productCategoryId 다.
 * categoryId 를 주면 그 최상위 카테고리에 속한 것만 돌려준다 (web useProductCategory 와 같다).
 *
 * shop(필터 시트)과 my(관심 상품 필터)가 같이 쓰므로 feature 가 아니라 entity 에 둔다 —
 * feature 끼리 import 하면 두 화면이 서로의 내부에 묶인다.
 */
export const useProductCategories = (categoryId?: number) => {
  const languageCode = useLanguage();

  return useAppQuery({
    // 키 앞머리가 "shop" 이었을 때는 같은 응답을 쓰는 my 쪽에서 남의 캐시처럼 보였다.
    queryKey: [
      "product",
      "categories",
      categoryId ?? "all",
      languageCode,
    ] as const,
    queryFn: () => getProductCategory({ languageCode, categoryId }),
    select: (res: CommonRes<GetProductCategoryRes>): GetProductCategoryRes =>
      res.data,
  });
};
