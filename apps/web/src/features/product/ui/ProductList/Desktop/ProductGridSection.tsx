"use client";

import { type ComponentProps, type RefObject, Suspense } from "react";

import { SearchIcon } from "lucide-react";

import { useTranslations } from "next-intl";

import { cn } from "@shared/lib/style";
import Divider from "@shared/ui/divider";

import { Link } from "@/i18n/navigation";

import { ProductCard } from "@entities/product";
import { Empty } from "@widgets/empty";
import { ProductCategoryFilter } from "@widgets/product-category-filter";

import type { FilterKey } from "../../../model/useProductFilter";
import FilterBar from "../../FilterBar";

interface ProductGridSectionProps {
  data?: ComponentProps<typeof ProductCard>["data"][];
  isEmpty: boolean;
  loadMoreRef: RefObject<HTMLDivElement | null>;
  onOpenFilterModal(): void;
  handleResetFilter(ignoreKeys?: FilterKey[]): void;
}

export default function ProductGridSection({
  data,
  isEmpty,
  loadMoreRef,
  onOpenFilterModal,
  handleResetFilter,
}: ProductGridSectionProps) {
  const t = useTranslations();

  return (
    <section className="flex flex-col gap-[20px]">
      <div>
        <div className="mb-[20px] flex items-center justify-between">
          <div />
          <FilterBar>
            <Suspense fallback={<FilterBar.SortSkeleton />}>
              <FilterBar.Sort />
            </Suspense>
            <Divider className="block bg-black/40" />
            <FilterBar.Option onClick={onOpenFilterModal} />
            <Divider className="block bg-black/40" />
            <FilterBar.Refresh onReset={() => handleResetFilter(["brandId"])} />
          </FilterBar>
        </div>
        <Suspense fallback={<></>}>
          <ProductCategoryFilter />
        </Suspense>
      </div>
      <div
        className={cn(
          "flex w-[1063px] flex-wrap gap-x-[20px] gap-y-[40px]",
          "min-h-[687px]",
        )}
      >
        {isEmpty ? (
          <Empty
            className="h-[687px] w-full"
            description={t("no_search_result")}
            icon={
              <SearchIcon className="text-black/30" height={24} width={24} />
            }
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
    </section>
  );
}
