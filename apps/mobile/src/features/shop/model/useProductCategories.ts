import useAppQuery from "@shared/lib/hooks/query/useAppQuery";
import { useLanguage } from "@shared/lib/i18n/useLanguage";
import type { GetProductCategoryRes } from "@shared/services/product";
import { getProductCategory } from "@shared/services/product";

import type { CommonRes } from "@shared/services";

export const useProductCategories = () => {
  const languageCode = useLanguage();

  return useAppQuery({
    queryKey: ["shop", "categories", languageCode] as const,
    queryFn: () => getProductCategory({ languageCode }),
    select: (res: CommonRes<GetProductCategoryRes>): GetProductCategoryRes =>
      res.data,
  });
};
