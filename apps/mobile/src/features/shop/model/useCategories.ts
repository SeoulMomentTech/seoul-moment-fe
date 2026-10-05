import useAppQuery from "@shared/lib/hooks/query/useAppQuery";
import { useLanguage } from "@shared/lib/i18n/useLanguage";
import type { GetCategoriesRes } from "@shared/services/category";
import { getCategories } from "@shared/services/category";

import type { CommonRes } from "@shared/services";

/** 최상위 카테고리. 시트의 Category 섹션과 product/filter 의 categoryId 가 여기서 나온다. */
export const useCategories = () => {
  const languageCode = useLanguage();

  return useAppQuery({
    queryKey: ["shop", "top-categories", languageCode] as const,
    queryFn: () => getCategories({ languageCode }),
    select: (res: CommonRes<GetCategoriesRes>): GetCategoriesRes => res.data,
  });
};
