import { useInfiniteQuery } from "@tanstack/react-query";

import {
  getProductList,
  type GetProductListReq,
} from "@/shared/services/product";

type UseInfiniteProductsParams = Omit<GetProductListReq, "page">;

export const useInfiniteProducts = (params: UseInfiniteProductsParams) => {
  return useInfiniteQuery({
    queryKey: ["products", "infinite", params],
    queryFn: ({ pageParam = 1 }) => {
      return getProductList({ ...params, page: pageParam as number });
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      // lastPage.data는 { total: number, list: [...] } 형태를 가집니다.
      const { total } = lastPage.data;

      // 지금까지 불러온 모든 아이템의 총 개수를 계산합니다.
      const fetchedItemsCount = allPages.reduce(
        (acc, page) => acc + page.data.list.length,
        0,
      );

      // 불러온 아이템의 수가 전체 아이템 수보다 적다면 다음 페이지가 존재합니다.
      if (fetchedItemsCount < total) {
        // 다음 페이지 번호를 반환합니다.
        return allPages.length + 1;
      }

      // 더 이상 불러올 페이지가 없으면 undefined를 반환합니다.
      return undefined;
    },
    select: (res) => res.pages.flatMap((page) => page.data.list),
  });
};
