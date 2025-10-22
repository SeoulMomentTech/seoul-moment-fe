"use client";

import { SearchIcon } from "lucide-react";
import { useState } from "react";
import { Link } from "@/i18n/navigation";
import Divider from "@/shared/ui/divider";
import { Empty } from "@/widgets/empty";
import { ProductCard } from "@entities/product";
import useLanguage from "@shared/lib/hooks/useLanguage";
import { cn } from "@shared/lib/style";
import type { GetProductListReq } from "@shared/services/product";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@shared/ui/accordion";
import { Button } from "@shared/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@shared/ui/tabs";
import { ProductCategoryFilter } from "@widgets/product-category-filter";
import useBrandFilter from "../../model/useBrandFilter";
import useCategories from "../../model/useCategories";
import { useInfiniteProducts } from "../../model/useInfiniteProducts";
import FilterBar from "../FilterBar";

interface DesktopProps {
  filter: Omit<GetProductListReq, "languageCode" | "count" | "page">;
  handleUpdateFilter(
    newFilter: Record<string, string | number | undefined | null>,
  ): () => void;
  handleResetFilter(): void;
}

export default function DeskTop({
  filter,
  handleUpdateFilter,
  handleResetFilter,
}: DesktopProps) {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const languageCode = useLanguage();

  const { data: categories } = useCategories();
  const { data: brandFilters } = useBrandFilter();

  const { data } = useInfiniteProducts({
    ...filter,
    languageCode,
  });

  const handleChangeCategory = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  const isEmpty = data?.length === 0;

  return (
    <div className={cn("flex flex-col gap-[40px] pb-[100px]", "max-sm:hidden")}>
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
            className="text-[18px]"
            onClick={handleUpdateFilter({ categoryId: null })}
            value="all"
          >
            All
          </TabsTrigger>
          {categories.map((category) => (
            <TabsTrigger
              className="text-[18px]"
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
                        onClick={handleUpdateFilter({ brandId: brand.id })}
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
                <FilterBar.Sort />
                <Divider className="block bg-black/40" />
                <FilterBar.Option />
                <Divider className="block bg-black/40" />
                <FilterBar.Refresh onReset={handleResetFilter} />
              </FilterBar>
            </div>
            <ProductCategoryFilter
              onCategoryChange={handleChangeCategory}
              selectedCategory={selectedCategory}
            />
          </div>
          <div
            className={cn(
              "flex w-[1063px] flex-wrap gap-x-[20px] gap-y-[40px]",
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
                {data?.map((product, index) => (
                  <Link
                    className="flex-1"
                    href="/product/1"
                    key={`${index + 1}`}
                  >
                    <ProductCard
                      className="max-sm:flex-1"
                      data={product}
                      imageClassName=" w-[196px] h-[196px] max-sm:w-full max-sm:h-[150px]"
                    />
                  </Link>
                ))}
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
