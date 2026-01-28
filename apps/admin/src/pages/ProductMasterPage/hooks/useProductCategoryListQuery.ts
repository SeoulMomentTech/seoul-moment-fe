import { getAdminProductCategoryList } from "@shared/services/productCategory";

import { useQuery } from "@tanstack/react-query";

import { ADMIN_PRODUCT_QUERY_KEY } from "./queryKeys";

export const useProductCategoryListQuery = () => {
  return useQuery({
    queryKey: [...ADMIN_PRODUCT_QUERY_KEY, "product-categories"],
    queryFn: () => getAdminProductCategoryList({ page: 1, count: 100 }),
    select: (data) => data.data.list,
  });
};
