import { Suspense } from "react";

import type { GetProductListReq } from "@shared/services/product";
import Divider from "@shared/ui/divider";

import ProductCardList from "./ProductCardList";
import type { FilterKey } from "../../../model/useProductFilter";
import FilterBar from "../../FilterBar";
import { ProductCategoryFilter } from "../../ProductCategoryFilter";
import { ProductCategoryFilterSkeleton } from "../../ProductCategoryFilterSkeleton";

interface ProductGridSectionProps {
  onOpenFilterModal(): void;
  handleResetFilter(ignoreKeys?: FilterKey[]): void;
  filter: Omit<GetProductListReq, "languageCode" | "count" | "page">;
}

export default function ProductGridSection({
  onOpenFilterModal,
  handleResetFilter,
  filter,
}: ProductGridSectionProps) {
  return (
    <section className="flex min-w-0 flex-1 flex-col gap-[20px]">
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
        <Suspense fallback={<ProductCategoryFilterSkeleton />}>
          <ProductCategoryFilter />
        </Suspense>
      </div>
      <ProductCardList filter={filter} />
    </section>
  );
}
