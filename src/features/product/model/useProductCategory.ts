import { useQuery } from "@tanstack/react-query";
import useLanguage from "@shared/lib/hooks/useLanguage";
import { getProductCategory } from "@shared/services/product";

const useProductCategory = (categoryId: number) => {
  const languageCode = useLanguage();
  return useQuery({
    queryKey: ["product-category", categoryId, languageCode],
    queryFn: () =>
      getProductCategory({
        categoryId,
        languageCode,
      }),
    select: (res) => res.data.list,
  });
};

export default useProductCategory;
