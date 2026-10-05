import useAppQuery from "@shared/lib/hooks/query/useAppQuery";
import { useLanguage } from "@shared/lib/i18n/useLanguage";
import type { GetProductFilterRes } from "@shared/services/product";
import { getProductFilter } from "@shared/services/product";

import type { CommonRes } from "@shared/services";

/**
 * product/filter 는 categoryId 가 필수다. 카테고리를 고르기 전에는 요청 자체를 보내지 않는다.
 * productCategoryId 를 주면 그 상품 카테고리에 실제로 있는 옵션만 돌려준다.
 * (예: 패션 전체는 사이즈·성별·색상·재질·핏감·제조국가 6그룹, 후드/집업은 색상·성별·사이즈·재질 4그룹)
 */
export const useProductOptionFilters = (
  categoryId?: number,
  productCategoryId?: number,
) => {
  const languageCode = useLanguage();

  return useAppQuery({
    queryKey: [
      "shop",
      "option-filters",
      categoryId,
      productCategoryId,
      languageCode,
    ] as const,
    queryFn: () =>
      getProductFilter({
        languageCode,
        categoryId: categoryId as number,
        productCategoryId,
      }),
    select: (res: CommonRes<GetProductFilterRes>): GetProductFilterRes =>
      res.data,
    enabled: typeof categoryId === "number" && Number.isFinite(categoryId),
  });
};
