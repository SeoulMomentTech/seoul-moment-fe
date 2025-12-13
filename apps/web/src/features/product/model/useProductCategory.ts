import { useLanguage } from "@shared/lib/hooks";
import { getProductCategory } from "@shared/services/product";

import { useSuspenseQuery } from "@tanstack/react-query";

const useProductCategory = (categoryId?: number) => {
  const languageCode = useLanguage();
  return useSuspenseQuery({
    queryKey: ["product-category", categoryId ?? "all", languageCode],
    queryFn: () =>
      getProductCategory({
        categoryId,
        languageCode,
      }),
    select: (res) => res.data.list,
  });
};

export default useProductCategory;
