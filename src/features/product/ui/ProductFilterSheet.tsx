"use client";

import { AccordionContent } from "@radix-ui/react-accordion";
import { type PropsWithChildren } from "react";
import { cn } from "@/shared/lib/style";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/ui/accordion";
import { Button } from "@/shared/ui/button";

import { FilterSheet } from "@/widgets/filter-sheet";
import useBrandFilter from "../model/useBrandFilter";
import useCategories from "../model/useCategories";

interface FilterSheetProps extends PropsWithChildren {
  isOpen: boolean;
  handleIsOpen(open: boolean): void;
}

const ProductFilterSheet = ({
  children,
  isOpen,
  handleIsOpen,
}: FilterSheetProps) => {
  const { data: categories } = useCategories();
  const { data: brandFilters } = useBrandFilter();

  return (
    <FilterSheet
      content={(filter, handleFilter) => (
        <Accordion type="multiple">
          <AccordionItem className="border-b-black/20" value="category">
            <AccordionTrigger>카테고리</AccordionTrigger>
            <AccordionContent>
              {categories.map((category) => (
                <Button
                  className={cn(
                    "justify-start py-[10px] pl-[14px] text-start text-black/40",
                    "hover:bg-transparent hover:text-black",
                    filter.categoryId === category.id && "text-black",
                  )}
                  key={`mobile-${category.id}`}
                  onClick={() => handleFilter({ categoryId: category.id })}
                  size="sm"
                  variant="ghost"
                >
                  {category.name}
                </Button>
              ))}
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="brand">
            <AccordionTrigger>브랜드</AccordionTrigger>
            <AccordionContent>
              <Accordion collapsible type="single">
                {brandFilters.map((item) => (
                  <AccordionItem
                    className="pl-[14px]"
                    hideBorder
                    key={item.name}
                    value={item.filter}
                  >
                    <AccordionTrigger className="font-semibold">
                      {item.name}
                    </AccordionTrigger>
                    {item.brandNameList.length > 0 && (
                      <AccordionContent className="flex flex-col pb-0 pl-[12px]">
                        {item.brandNameList.map((brand) => (
                          <Button
                            className={cn(
                              "justify-start px-0 py-[10px] text-start text-black/40",
                              "hover:bg-transparent hover:text-black",
                              filter.brandId === brand.id && "text-black",
                            )}
                            key={brand.id}
                            onClick={() => handleFilter({ brandId: brand.id })}
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
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
      handleIsOpen={handleIsOpen}
      isOpen={isOpen}
    >
      {children}
    </FilterSheet>
  );
};

export default ProductFilterSheet;
