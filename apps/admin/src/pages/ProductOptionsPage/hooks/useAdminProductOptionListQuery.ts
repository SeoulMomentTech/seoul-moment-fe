import {
  getAdminProductOptionList,
  type AdminProductOptionListParams,
} from "@shared/services/productOption";

import { useQuery } from "@tanstack/react-query";

export const useAdminProductOptionListQuery = (
  params?: AdminProductOptionListParams,
) => {
  return useQuery({
    queryKey: ["admin-product-option-list", params],
    queryFn: () => getAdminProductOptionList(params),
  });
};
