import { getAdminCategoryList } from "@shared/services/category";

import { useQuery } from "@tanstack/react-query";

import { ADMIN_PRODUCT_QUERY_KEY } from "./queryKeys";

export const useCategoryListQuery = () => {
  return useQuery({
    queryKey: [...ADMIN_PRODUCT_QUERY_KEY, "categories"],
    queryFn: () => getAdminCategoryList({ page: 1, count: 100 }),
    select: (data) => data.data.list,
  });
};
