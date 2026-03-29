import { useAppQuery } from "@shared/hooks/useAppQuery";
import {
  getAdminProductOptionList,
  type AdminProductOptionListParams,
} from "@shared/services/productOption";



import { productOptionQueryKeys } from "./queryKey";

export const useAdminProductOptionListQuery = (
  params?: AdminProductOptionListParams,
) => {
  return useAppQuery({
    queryKey: productOptionQueryKeys.list(params),
    queryFn: () => getAdminProductOptionList(params),
  });
};
