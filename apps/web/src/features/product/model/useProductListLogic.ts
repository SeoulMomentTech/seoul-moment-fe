import { useCallback, useRef } from "react";

import { useTranslations } from "next-intl";

import { useIntersectionObserver, useLanguage } from "@shared/lib/hooks";
import type { GetProductListReq } from "@shared/services/product";

import { useInfiniteProducts } from "./useInfiniteProducts";

type FilterProps = Omit<GetProductListReq, "languageCode" | "count" | "page">;

export function useProductListLogic(filter: FilterProps) {
  const t = useTranslations();
  const languageCode = useLanguage();
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteProducts({
      ...filter,
      languageCode,
    });

  const handleIntersect = useCallback(() => {
    if (!isFetchingNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, isFetchingNextPage]);

  useIntersectionObserver({
    target: loadMoreRef,
    enabled: hasNextPage,
    rootMargin: "200px",
    onIntersect: handleIntersect,
  });

  const isEmpty = data?.length === 0;

  return {
    t,
    loadMoreRef,
    data,
    isLoading,
    isFetchingNextPage,
    isEmpty,
    hasNextPage,
    fetchNextPage,
  };
}
