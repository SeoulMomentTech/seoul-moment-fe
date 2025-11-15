import useLanguage from "@shared/lib/hooks/useLanguage";
import { getProductSortFilter } from "@shared/services/product";

import { useQuery } from "@tanstack/react-query";

const useProductSortFilter = () => {
  const languageCode = useLanguage();

  return useQuery({
    queryKey: ["product-sort-filter", languageCode],
    queryFn: () => getProductSortFilter({ languageCode }),
    select: (res) => res.data.list,
  });
};

export default useProductSortFilter;
