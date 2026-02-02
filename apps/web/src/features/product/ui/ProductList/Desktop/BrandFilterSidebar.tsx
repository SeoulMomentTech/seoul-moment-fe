"use client";

import { useMemo } from "react";

import { useTranslations } from "next-intl";

import { cn } from "@shared/lib/style";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Button,
} from "@seoul-moment/ui";

import useBrandFilter from "../../../model/useBrandFilter";

interface BrandFilterSidebarProps {
  currentBrandId?: number | null;
  handleUpdateFilter(
    newFilter: Record<string, string | number | undefined | null>,
  ): () => void;
}

export default function BrandFilterSidebar({
  currentBrandId,
  handleUpdateFilter,
}: BrandFilterSidebarProps) {
  const { data: brandFilters } = useBrandFilter();
  const t = useTranslations();

  const filteredBrandFilters = useMemo(
    () => brandFilters.filter((item) => item.brandNameList.length > 0),
    [brandFilters],
  );

  return (
    <aside className="min-w-[197px] max-sm:hidden">
      <h2 className="text-title-4 mb-[20px] font-bold max-sm:hidden">
        {t("product_brand")}
      </h2>
      <Accordion collapsible type="single">
        {filteredBrandFilters
          .filter((item) => item.brandNameList.length > 0)
          .map((item) => (
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
                        currentBrandId === brand.id && "text-black",
                      )}
                      key={brand.id}
                      onClick={handleUpdateFilter({
                        brandId: currentBrandId === brand.id ? null : brand.id,
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
  );
}
