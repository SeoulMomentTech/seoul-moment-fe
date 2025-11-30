import useLanguage from "@shared/lib/hooks/useLanguage";
import type { SortOption } from "@shared/services/product";
import { getProductSortFilter } from "@shared/services/product";

import { useSuspenseQuery } from "@tanstack/react-query";

const useProductSortFilter = () => {
  const languageCode = useLanguage();

  return useSuspenseQuery({
    queryKey: ["product-sort-filter", languageCode],
    queryFn: () => getProductSortFilter({ languageCode }),
    select: (res) => {
      const list = res.data.list;
      const sortMap = list.reduce(
        (prev, cur) => ({
          ...prev,
          [`${cur.sortColumn}_${cur.sort}`]: cur,
        }),
        {} as Record<string, SortOption>,
      );

      return {
        list,
        sortMap,
      };
    },
  });
};

export default useProductSortFilter;
