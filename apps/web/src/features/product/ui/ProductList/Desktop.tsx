"use client";

import { lazy, Suspense, useCallback, useRef } from "react";

import { SearchIcon } from "lucide-react";

import { useLanguage } from "@shared/lib/hooks";
import { useOpen, useIntersectionObserver } from "@shared/lib/hooks";
import { cn } from "@shared/lib/style";
import type { GetProductListReq } from "@shared/services/product";
import Divider from "@shared/ui/divider";

import { Link } from "@/i18n/navigation";

import { ProductCard } from "@entities/product";
import { Tabs, TabsList, TabsTrigger } from "@seoul-moment/ui";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Button,
} from "@seoul-moment/ui";
import { Empty } from "@widgets/empty";
import { ProductCategoryFilter } from "@widgets/product-category-filter";

import useBrandFilter from "../../model/useBrandFilter";
import useCategories from "../../model/useCategories";
import { useInfiniteProducts } from "../../model/useInfiniteProducts";
import type { FilterKey } from "../../model/useProductFilter";
import FilterBar from "../FilterBar";

const ProductFilterModal = lazy(() => import("../ProductFilterModal"));

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
  const languageCode = useLanguage();

  const { isOpen, update } = useOpen();
  const { data: categories } = useCategories();
  const { data: brandFilters } = useBrandFilter();
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
    <>
      <div
        className={cn("flex flex-col gap-[40px] pb-[100px]", "max-sm:hidden")}
      >
        <Tabs
          className={cn(
            "border-b border-black/10 max-sm:border-t max-sm:pl-[20px]",
            "max-sm:hidden",
          )}
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
        <div
          className={cn("flex gap-[20px]", "max-sm:flex-col max-sm:gap-[12px]")}
        >
          <aside className="min-w-[197px] max-sm:hidden">
            <h2 className="text-title-4 mb-[20px] font-bold max-sm:hidden">
              브랜드
            </h2>
            <Accordion collapsible type="single">
              {brandFilters.map((item) => (
                <AccordionItem hideBorder key={item.name} value={item.filter}>
                  <AccordionTrigger className="font-semibold">
                    {item.name}
                  </AccordionTrigger>
                  {item.brandNameList.length > 0 && (
                    <AccordionContent className="flex flex-col pb-0">
                      {item.brandNameList.map((brand) => (
                        <Button
                          className={cn(
                            "justify-start px-0 py-[10px] text-start text-black/40",
                            "h-[34px] hover:bg-transparent hover:text-black focus:ring-0",
                            filter.brandId === brand.id && "text-black",
                          )}
                          key={brand.id}
                          onClick={handleUpdateFilter({
                            brandId:
                              filter.brandId === brand.id ? null : brand.id,
                          })}
                          size="sm"
                          variant="ghost"
                        >
                          {brand.name}
                        </Button>
                      ))}
                    </AccordionContent>
                  )}
                </AccordionItem>
              ))}
            </Accordion>
          </aside>
          <section className="flex flex-col gap-[20px]">
            <div>
              <div className="mb-[20px] flex items-center justify-between">
                <div />
                <FilterBar>
                  <Suspense fallback={<FilterBar.SortSkeleton />}>
                    <FilterBar.Sort />
                  </Suspense>
                  <Divider className="block bg-black/40" />
                  <FilterBar.Option onClick={() => update(true)} />
                  <Divider className="block bg-black/40" />
                  <FilterBar.Refresh
                    onReset={() => handleResetFilter(["brandId"])}
                  />
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
                  description="검색 결과가 없습니다."
                  icon={
                    <SearchIcon
                      className="text-black/30"
                      height={24}
                      width={24}
                    />
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
        </div>
      </div>
      {isOpen && <ProductFilterModal handleIsOpen={update} isOpen={isOpen} />}
    </>
  );
}
