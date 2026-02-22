"use client";

import { lazy } from "react";

import { useOpen } from "@shared/lib/hooks";
import { cn } from "@shared/lib/style";
import type { GetProductListReq } from "@shared/services/product";

import { Flex, SearchBar, Tabs, TabsList, TabsTrigger } from "@seoul-moment/ui";

import BrandFilterSidebar from "./BrandFilterSidebar";
import ProductGridSection from "./ProductGridSection";
import useCategories from "../../../model/useCategories";
import type { FilterKey } from "../../../model/useProductFilter";

const ProductFilterModal = lazy(() => import("../../ProductFilterModal"));

interface DesktopProps {
  filter: Omit<GetProductListReq, "languageCode" | "count" | "page">;
  handleUpdateFilter(
    newFilter: Record<string, string | number | undefined | null>,
  ): () => void;
  handleResetFilter(ignoreKeys?: FilterKey[]): void;
}

export default function DeskTop({
  filter,
  handleUpdateFilter,
  handleResetFilter,
}: DesktopProps) {
  const { isOpen, update } = useOpen();
  const { data: categories } = useCategories();

  return (
    <>
      <div
        className={cn("flex flex-col gap-[40px] pb-[100px]", "max-sm:hidden")}
      >
        <Flex
          className={cn(
            "border-b border-black/10 max-sm:border-t max-sm:pl-[20px]",
            "max-sm:hidden",
          )}
          justify="space-between"
        >
          <Tabs
            defaultValue="all"
            value={filter.categoryId?.toString() ?? "all"}
          >
            <TabsList className="flex h-[50px] items-center gap-[30px] max-sm:h-[40px]">
              <TabsTrigger
                className="text-body-1"
                onClick={handleUpdateFilter({ categoryId: null })}
                value="all"
              >
                All
              </TabsTrigger>
              {categories.map((category) => (
                <TabsTrigger
                  className="text-body-1"
                  key={category.id}
                  onClick={handleUpdateFilter({ categoryId: category.id })}
                  value={category.id.toString()}
                >
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <SearchBar
            className="h-[42px] w-[278px]"
            defaultValue={filter.search ?? ""}
            key={filter.search ?? "search-bar"}
            onSearch={(value) =>
              handleUpdateFilter({ search: value || null })()
            }
          />
        </Flex>
        <div
          className={cn("flex gap-[20px]", "max-sm:flex-col max-sm:gap-[12px]")}
        >
          <BrandFilterSidebar
            currentBrandId={filter.brandId}
            handleUpdateFilter={handleUpdateFilter}
          />
          <ProductGridSection
            filter={filter}
            handleResetFilter={handleResetFilter}
            onOpenFilterModal={() => update(true)}
          />
        </div>
      </div>
      {isOpen && <ProductFilterModal handleIsOpen={update} isOpen={isOpen} />}
    </>
  );
}
