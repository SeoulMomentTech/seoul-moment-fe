"use client";

import { memo, useCallback, useRef } from "react";

import { SearchIcon } from "lucide-react";

import { useTranslations } from "next-intl";

import { useIntersectionObserver, useLanguage } from "@shared/lib/hooks";
import { cn } from "@shared/lib/style";
import type { GetProductListReq } from "@shared/services/product";

import { Link } from "@/i18n/navigation";

import { ProductCard } from "@entities/product";
import { Empty } from "@widgets/empty";

import { useInfiniteProducts } from "../../../model/useInfiniteProducts";
import { ProductCardSkeleton } from "../../ProductCardSkeleton";

interface ProductCardListProps {
  filter: Omit<GetProductListReq, "languageCode" | "count" | "page">;
}

const DESKTOP_PAGE_SIZE = 15;

const ProductCardList = memo(function ProductCardList({
  filter,
}: ProductCardListProps) {
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

  return (
    <div
      aria-busy={isLoading}
      className={cn(
        "flex w-[1063px] flex-wrap gap-x-[20px] gap-y-[40px]",
        "min-h-[687px]",
      )}
      role="status"
    >
      {isLoading ? (
        Array.from({ length: DESKTOP_PAGE_SIZE }).map((_, i) => (
          <ProductCardSkeleton
            className="h-fit w-[196px]"
            imageClassName="h-[196px]"
            key={`desktop-product-skeleton-${i + 1}`}
          />
        ))
      ) : isEmpty ? (
        <Empty
          className="h-[687px] w-full"
          description={t("no_search_result")}
          icon={<SearchIcon className="text-black/30" height={24} width={24} />}
        />
      ) : (
        <>
          {data?.map((product) => (
            <Link
              className="h-fit w-[196px]"
              href={`/product/${product.id}`}
              key={product.id}
            >
              <ProductCard
                className="max-sm:flex-1"
                data={product}
                imageClassName="w-[196px] h-[196px]"
              />
            </Link>
          ))}
          {isFetchingNextPage &&
            Array.from({ length: 5 }).map((_, i) => (
              <ProductCardSkeleton
                className="h-fit w-[196px]"
                imageClassName="h-[196px]"
                key={`desktop-fetching-next-${i + 1}`}
              />
            ))}
          <div className="h-px w-full" ref={loadMoreRef} />
        </>
      )}
    </div>
  );
});

export default ProductCardList;
