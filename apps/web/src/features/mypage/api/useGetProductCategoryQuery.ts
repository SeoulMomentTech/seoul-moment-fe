import { useLanguage } from "@shared/lib/hooks";
import { getProductCategory } from "@shared/services/product";

import useAppQuery from "@/shared/lib/hooks/query/useAppQuery";

type GetProductCategoryRes = Awaited<ReturnType<typeof getProductCategory>>;

export function useGetProductCategoryQuery() {
  const languageCode = useLanguage();

  return useAppQuery<
    GetProductCategoryRes,
    Error,
    GetProductCategoryRes["data"]
  >({
    queryKey: ["product-category", "all", languageCode],
    queryFn: () => getProductCategory({ languageCode }),
    select: (res) => res.data,
    staleTime: 10 * 60 * 1000,
  });
}
