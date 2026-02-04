"use client";

import { Suspense } from "react";

import { useTranslations } from "next-intl";

import { useOpen } from "@shared/lib/hooks";
import { cn } from "@shared/lib/style";
import type { GetProductListReq } from "@shared/services/product";
import { FilterIcon } from "@shared/ui/icon";

import { Button } from "@seoul-moment/ui";

import ProductListSection from "./ProductListSection";
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
  const { count } = useProductFilter();
  const t = useTranslations();

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
                {t("select_filter")}{" "}
                {count > 0 && (
                  <span className="text-body-3 text-orange">{count}</span>
                )}
              </Button>
            </ProductFilterSheet>
            <Suspense fallback={<FilterBar.SortSkeleton />}>
              <FilterBar.Sort />
            </Suspense>
          </div>

          <ProductListSection filter={filter} />
        </section>
      </div>
    </div>
  );
}
