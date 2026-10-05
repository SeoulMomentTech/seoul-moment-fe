import useAppQuery from "@shared/lib/hooks/query/useAppQuery";
import { useLanguage } from "@shared/lib/i18n/useLanguage";
import type { GetProductSortFilterRes } from "@shared/services/product";
import { getProductSortFilter } from "@shared/services/product";

import type { CommonRes } from "@shared/services";

export const useProductSortOptions = () => {
  const languageCode = useLanguage();

  return useAppQuery({
    queryKey: ["shop", "sort-options", languageCode] as const,
    queryFn: () => getProductSortFilter({ languageCode }),
    select: (
      res: CommonRes<GetProductSortFilterRes>,
    ): GetProductSortFilterRes => res.data,
  });
};
