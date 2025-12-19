"use client";

import { Suspense, useCallback, useRef } from "react";

import { useLanguage } from "@shared/lib/hooks";
import { useOpen, useIntersectionObserver } from "@shared/lib/hooks";
import { cn } from "@shared/lib/style";
import type { GetProductListReq } from "@shared/services/product";
import { FilterIcon } from "@shared/ui/icon";

import { Button } from "@seoul-moment/ui";

import ProductListSection from "./ProductListSection";
import { useInfiniteProducts } from "../../../model/useInfiniteProducts";
import useProductFilter from "../../../model/useProductFilter";
import FilterBar from "../../FilterBar";
import ProductFilterSheet from "../../ProductFilterSheet";

interface MobileProps {
  filter: Omit<GetProductListReq, "languageCode" | "count" | "page">;
  handleUpdateFilter(
    newFilter: Record<string, string | number | undefined | null>,
  ): () => void;
  handleResetFilter(): void;
}

export default function Mobile({ filter }: MobileProps) {
  const { isOpen, update } = useOpen();
  const languageCode = useLanguage();
  const { count } = useProductFilter();
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
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
    <div>
      <div className={cn("flex flex-col gap-[12px]")}>
        <section className="flex flex-col gap-[20px] pb-[50px]">
          <div className="flex h-[56px] items-center justify-between py-[20px]">
            <ProductFilterSheet handleIsOpen={update} isOpen={isOpen}>
              <Button
                className="flex h-full gap-[4px] p-0"
                size="sm"
                variant="ghost"
              >
                <FilterIcon />
                필터{" "}
                {count > 0 && (
                  <span className="text-body-3 text-orange">{count}</span>
                )}
              </Button>
            </ProductFilterSheet>
            <Suspense fallback={<FilterBar.SortSkeleton />}>
              <FilterBar.Sort />
            </Suspense>
          </div>

          <ProductListSection
            data={data}
            isEmpty={isEmpty}
            loadMoreRef={loadMoreRef}
          />
        </section>
      </div>
    </div>
  );
}
