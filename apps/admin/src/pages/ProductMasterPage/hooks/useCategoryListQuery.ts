import { useAppQuery } from "@shared/hooks/useAppQuery";
import { getAdminCategoryList } from "@shared/services/category";



import { ADMIN_PRODUCT_QUERY_KEY } from "./queryKeys";

export const useCategoryListQuery = () => {
  return useAppQuery({
    queryKey: [...ADMIN_PRODUCT_QUERY_KEY, "categories"],
    queryFn: () => getAdminCategoryList({ page: 1, count: 100 }),
    select: (data) => data.data.list,
  });
};
