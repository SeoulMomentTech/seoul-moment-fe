"use client";

import { SearchIcon } from "lucide-react";

import { cn } from "@shared/lib/style";
import type { GetProductListReq } from "@shared/services/product";

import { Link } from "@/i18n/navigation";

import { ProductCard } from "@entities/product";
import { Empty } from "@widgets/empty";

import { useProductListLogic } from "../../../model/useProductListLogic";
import { ProductCardSkeleton } from "../../ProductCardSkeleton";

interface ProductListSectionProps {
  filter: Omit<GetProductListReq, "languageCode" | "count" | "page">;
}

const MOBILE_PAGE_SIZE = 8;

export default function ProductListSection({
  filter,
}: ProductListSectionProps) {
  const { data, isEmpty, isFetchingNextPage, isLoading, loadMoreRef, t } =
    useProductListLogic(filter);

  return (
    <div
      aria-busy={isLoading}
      className={cn(
        "min-h-[400px] w-full",
        !isEmpty || isLoading
          ? "grid grid-cols-2 gap-x-[20px] gap-y-[30px]"
          : "block",
      )}
      role="status"
    >
      {isLoading ? (
        Array.from({ length: MOBILE_PAGE_SIZE }).map((_, i) => (
          <ProductCardSkeleton
            className="flex-1"
            imageClassName="h-[150px]"
            key={`mobile-product-skeleton-${i + 1}`}
          />
        ))
      ) : isEmpty ? (
        <Empty
          className="h-[400px] w-full"
          description={t("no_search_result")}
          icon={<SearchIcon className="text-black/30" height={24} width={24} />}
        />
      ) : (
        <>
          {data?.map((product) => (
            <Link
              className="flex-1"
              href={`/product/${product.id}`}
              key={`mobile-product-${product.id}`}
            >
              <ProductCard
                className="h-full flex-1"
                contentClassName="h-full justify-between"
                contentWrapperClassName="h-full justify-between"
                data={product}
                imageClassName="max-sm:w-full max-sm:max-h-[150px] max-sm:min-h-[150px]"
              />
            </Link>
          ))}
          {isFetchingNextPage &&
            Array.from({ length: 4 }).map((_, i) => (
              <ProductCardSkeleton
                className="flex-1"
                imageClassName="h-[150px]"
                key={`mobile-fetching-next-${i + 1}`}
              />
            ))}
          <div className="h-px w-full" ref={loadMoreRef} />
        </>
      )}
    </div>
  );
}
