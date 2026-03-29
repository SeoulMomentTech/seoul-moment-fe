import { useAppQuery } from "@shared/hooks/useAppQuery";
import { getAdminBrandList } from "@shared/services/brand";



import { ADMIN_PRODUCT_QUERY_KEY } from "./queryKeys";

export const useBrandListQuery = () => {
  return useAppQuery({
    queryKey: [...ADMIN_PRODUCT_QUERY_KEY, "brands"],
    queryFn: () => getAdminBrandList({ page: 1, count: 100 }), // Fetch enough for dropdown
    select: (data) => data.data.list,
  });
};
