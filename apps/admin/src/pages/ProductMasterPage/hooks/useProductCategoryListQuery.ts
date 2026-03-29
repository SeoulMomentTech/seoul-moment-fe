import { useAppQuery } from "@shared/hooks/useAppQuery";
import { getAdminProductCategoryList } from "@shared/services/productCategory";



import { ADMIN_PRODUCT_QUERY_KEY } from "./queryKeys";

export const useProductCategoryListQuery = () => {
  return useAppQuery({
    queryKey: [...ADMIN_PRODUCT_QUERY_KEY, "product-categories"],
    queryFn: () => getAdminProductCategoryList({ page: 1, count: 100 }),
    select: (data) => data.data.list,
  });
};
