import useAppQuery from "@shared/lib/hooks/query/useAppQuery";
import { useLanguage } from "@shared/lib/i18n/useLanguage";
import type { GetProductCategoryRes } from "@shared/services/product";
import { getProductCategory } from "@shared/services/product";

import type { CommonRes } from "@shared/services";

/**
 * 상품 카테고리. 여기 id 는 productCategoryId 다.
 * categoryId 를 주면 그 최상위 카테고리에 속한 것만 돌려준다 (web useProductCategory 와 같다).
 */
export const useProductCategories = (categoryId?: number) => {
  const languageCode = useLanguage();

  return useAppQuery({
    queryKey: [
      "shop",
      "categories",
      categoryId ?? "all",
      languageCode,
    ] as const,
    queryFn: () => getProductCategory({ languageCode, categoryId }),
    select: (res: CommonRes<GetProductCategoryRes>): GetProductCategoryRes =>
      res.data,
  });
};
