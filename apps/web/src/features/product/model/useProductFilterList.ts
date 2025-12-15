import { useAppQuery, useLanguage } from "@shared/lib/hooks";
import { getProductFilter } from "@shared/services/product";

interface UseProductFilterListParams {
  categoryId?: number;
  brandId?: number;
  productCategoryId?: number;
}

const useProductFilterList = ({
  categoryId,
  brandId,
  productCategoryId,
}: UseProductFilterListParams) => {
  const languageCode = useLanguage();

  return useAppQuery({
    queryKey: [
      "product-filter",
      languageCode,
      categoryId,
      brandId,
      productCategoryId,
    ],
    queryFn: () =>
      getProductFilter({
        categoryId: categoryId as number,
        brandId,
        productCategoryId,
        languageCode,
      }),
    select: (res) => res.data.list,
    enabled: categoryId != null,
  });
};

export default useProductFilterList;
