import useAppQuery from "@shared/lib/hooks/query/useAppQuery";
import { useLanguage } from "@shared/lib/i18n/useLanguage";
import type { GetProductFilterRes } from "@shared/services/product";
import { getProductFilter } from "@shared/services/product";

import type { CommonRes } from "@shared/services";

/**
 * product/filter 는 categoryId 가 필수다. 카테고리를 고르기 전에는 요청 자체를 보내지 않는다.
 */
export const useProductOptionFilters = (categoryId?: number) => {
  const languageCode = useLanguage();

  return useAppQuery({
    queryKey: ["shop", "option-filters", categoryId, languageCode] as const,
    queryFn: () =>
      getProductFilter({ languageCode, categoryId: categoryId as number }),
    select: (res: CommonRes<GetProductFilterRes>): GetProductFilterRes =>
      res.data,
    enabled: typeof categoryId === "number" && Number.isFinite(categoryId),
  });
};
