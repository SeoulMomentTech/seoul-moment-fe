import type {
  GetProductListReq,
  GetProductListRes,
} from "@shared/services/product";
import { getProductList } from "@shared/services/product";

import type { CommonRes } from "@shared/services";
import type { UseQueryOptions } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";

interface UseProductsProps<T> {
  options: UseQueryOptions<T>;
  params: GetProductListReq;
}

const useProducts = ({
  options,
  params,
}: UseProductsProps<CommonRes<GetProductListRes>>) => {
  return useQuery({
    ...options,
    queryFn: () => getProductList(params),
    select: (res) => res.data,
  });
};

export default useProducts;
