"use client";

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

  return (
    <aside className="min-w-[197px] max-sm:hidden">
      <h2 className="text-title-4 mb-[20px] font-bold max-sm:hidden">브랜드</h2>
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
