"use client";

import { SearchIcon } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Empty } from "@/widgets/empty";
import { ProductCard } from "@entities/product";
import useFilter from "@shared/lib/hooks/useFilter";
import useLanguage from "@shared/lib/hooks/useLanguage";
import useOpen from "@shared/lib/hooks/useOpen";
import { cn } from "@shared/lib/style";
import type { GetProductListReq } from "@shared/services/product";

import { Button } from "@shared/ui/button";
import { FilterIcon } from "@shared/ui/icon";
import { useInfiniteProducts } from "../../model/useInfiniteProducts";
import SortFilter from "../FilterBar/SortFilter";
import ProductFilterSheet from "../ProductFilterSheet";

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
  const { count } = useFilter();
  const { data } = useInfiniteProducts({
    ...filter,
    languageCode,
  });

  const isEmpty = data?.length === 0;

  return (
    <div
      className={cn(
        "hidden pb-[50px]",
        "max-sm:flex max-sm:flex-col max-sm:gap-0",
      )}
    >
      <div className={cn("flex", "max-sm:flex-col max-sm:gap-[12px]")}>
        <section className="flex flex-col gap-[20px]">
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
            <SortFilter />
          </div>

          {isEmpty ? (
            <div>
              <Empty
                className="h-[400px] w-full"
                description="검색 결과가 없습니다."
                icon={
                  <SearchIcon
                    className="text-black/30"
                    height={24}
                    width={24}
                  />
                }
              />
            </div>
          ) : (
            <div
              className={cn(
                "gap-x-[20px] gap-y-[40px]",
                "max-sm:w-full max-sm:gap-y-[30px]",
                "max-sm:grid max-sm:grid-cols-2",
              )}
            >
              {data?.map((product, index) => (
                <Link className="flex-1" href="/product/1" key={`${index + 1}`}>
                  <ProductCard
                    className="max-sm:flex-1"
                    data={product}
                    imageClassName=" w-[196px] h-[196px] max-sm:w-full max-sm:h-[150px]"
                  />
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
