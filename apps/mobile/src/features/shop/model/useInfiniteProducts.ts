import { useShallow } from "zustand/react/shallow";

import { useLanguage } from "@shared/lib/i18n/useLanguage";
import type { GetProductListRes, ProductItem } from "@shared/services/product";
import { getProductList } from "@shared/services/product";

import type { CommonRes } from "@shared/services";
import type { InfiniteData } from "@tanstack/react-query";
import { useInfiniteQuery } from "@tanstack/react-query";

import { useShopFilterStore } from "./useShopFilterStore";

const PAGE_SIZE = 20;

export const useInfiniteProducts = () => {
  const languageCode = useLanguage();
  // 적용된 필터만 읽는다. 액션은 구독 대상에서 뺀다.
  const filter = useShopFilterStore(
    useShallow(
      ({
        search,
        brandId,
        categoryId,
        productCategoryId,
        optionIdList,
        sortColumn,
        sort,
      }) => ({
        search,
        brandId,
        categoryId,
        productCategoryId,
        optionIdList,
        sortColumn,
        sort,
      }),
    ),
  );

  return useInfiniteQuery({
    queryKey: ["shop", "products", filter, languageCode] as const,
    queryFn: ({ pageParam }) =>
      getProductList({
        languageCode,
        page: pageParam,
        count: PAGE_SIZE,
        ...filter,
      }),
    initialPageParam: 1,
    // 지금까지 받은 개수가 total 에 못 미칠 때만 다음 페이지를 준다. 아니면 undefined 로 멈춘다.
    getNextPageParam: (
      lastPage: CommonRes<GetProductListRes>,
      allPages: CommonRes<GetProductListRes>[],
    ): number | undefined =>
      allPages.length * PAGE_SIZE < lastPage.data.total
        ? allPages.length + 1
        : undefined,
    select: (
      data: InfiniteData<CommonRes<GetProductListRes>, number>,
    ): ProductItem[] => data.pages.flatMap((page) => page.data.list ?? []),
  });
};
