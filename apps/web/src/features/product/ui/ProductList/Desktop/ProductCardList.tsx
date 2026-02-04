"use client";

import { useCallback, useRef } from "react";

import { SearchIcon } from "lucide-react";

import { useTranslations } from "next-intl";

import { useIntersectionObserver, useLanguage } from "@shared/lib/hooks";
import { cn } from "@shared/lib/style";
import type { GetProductListReq } from "@shared/services/product";

import { Link } from "@/i18n/navigation";

import { ProductCard } from "@entities/product";
import { Skeleton } from "@seoul-moment/ui";
import { Empty } from "@widgets/empty";

import { useInfiniteProducts } from "../../../model/useInfiniteProducts";

interface ProductCardListProps {
  filter: Omit<GetProductListReq, "languageCode" | "count" | "page">;
}

export default function ProductCardList({ filter }: ProductCardListProps) {
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
      className={cn(
        "flex w-[1063px] flex-wrap gap-x-[20px] gap-y-[40px]",
        "min-h-[687px]",
      )}
    >
      {isLoading ? (
        Array.from({ length: 15 }).map((_, i) => (
          <div
            className="flex h-fit w-[196px] flex-col gap-3"
            // eslint-disable-next-line react/no-array-index-key
            key={i}
          >
            <Skeleton className="h-[196px] w-[196px]" />
            <div className="flex flex-col gap-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
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
          <div className="h-px w-full" ref={loadMoreRef} />
        </>
      )}
    </div>
  );
}
