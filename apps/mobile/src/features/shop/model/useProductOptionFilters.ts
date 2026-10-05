import useAppQuery from "@shared/lib/hooks/query/useAppQuery";
import { useLanguage } from "@shared/lib/i18n/useLanguage";
import type { GetProductFilterRes } from "@shared/services/product";
import { getProductFilter } from "@shared/services/product";

import type { CommonRes } from "@shared/services";

interface ProductOptionFilterScope {
  /** 필수. 없으면 요청 자체를 보내지 않는다 (API 가 validation 에러를 준다). */
  categoryId?: number;
  productCategoryId?: number;
  brandId?: number;
}

/**
 * 지금 고른 조건에 실제로 존재하는 옵션만 가져온다. 셋 다 결과를 좁힌다.
 * (패션 전체는 6그룹, 패션+후드/집업은 4그룹, 패션+브랜드2는 6그룹이지만 값 구성이 다르다.)
 * 조합에 상품이 없으면 빈 목록이 오는데, 그건 정상이다 — 고를 옵션이 정말 없다는 뜻이다.
 */
export const useProductOptionFilters = ({
  categoryId,
  productCategoryId,
  brandId,
}: ProductOptionFilterScope) => {
  const languageCode = useLanguage();

  return useAppQuery({
    queryKey: [
      "shop",
      "option-filters",
      categoryId,
      productCategoryId,
      brandId,
      languageCode,
    ] as const,
    queryFn: () =>
      getProductFilter({
        languageCode,
        categoryId: categoryId as number,
        productCategoryId,
        brandId,
      }),
    select: (res: CommonRes<GetProductFilterRes>): GetProductFilterRes =>
      res.data,
    enabled: typeof categoryId === "number" && Number.isFinite(categoryId),
  });
};
