import { getAdminBrandList } from "@shared/services/brand";

import { useQuery } from "@tanstack/react-query";

import { ADMIN_PRODUCT_QUERY_KEY } from "./queryKeys";

export const useBrandListQuery = () => {
  return useQuery({
    queryKey: [...ADMIN_PRODUCT_QUERY_KEY, "brands"],
    queryFn: () => getAdminBrandList({ page: 1, count: 100 }), // Fetch enough for dropdown
    select: (data) => data.data.list,
  });
};
