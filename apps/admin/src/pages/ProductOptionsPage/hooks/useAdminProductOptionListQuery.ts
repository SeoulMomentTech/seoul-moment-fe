import {
  getAdminProductOptionList,
  type AdminProductOptionListParams,
} from "@shared/services/productOption";

import { useQuery } from "@tanstack/react-query";

import { productOptionQueryKeys } from "./queryKey";

export const useAdminProductOptionListQuery = (
  params?: AdminProductOptionListParams,
) => {
  return useQuery({
    queryKey: productOptionQueryKeys.list(params),
    queryFn: () => getAdminProductOptionList(params),
  });
};
