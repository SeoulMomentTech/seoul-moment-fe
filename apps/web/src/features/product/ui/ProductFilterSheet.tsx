"use client";

import { useMemo, type PropsWithChildren } from "react";

import { cn } from "@shared/lib/style";
import type { Filter } from "@widgets/filter-sheet/ui/FilterSheet";

import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  Button,
} from "@seoul-moment/ui";
import { FilterSheet } from "@widgets/filter-sheet";

import Options from "./Options";
import { getOptionMetaById } from "../lib/getOptionMetaById";
import useBrandFilter from "../model/useBrandFilter";
import useCategories from "../model/useCategories";
import useProductFilterList from "../model/useProductFilterList";

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
        <Accordion defaultValue={["category", "brand"]} type="multiple">
          <AccordionItem className="border-b-black/20" value="category">
            <AccordionTrigger>카테고리</AccordionTrigger>
            <AccordionContent className="flex flex-col pb-0">
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
          <AccordionItem className="border-b-black/20" value="brand">
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
          {filter.categoryId && (
            <OptionalFilters filter={filter} handleFilter={handleFilter} />
          )}
        </Accordion>
      )}
      handleIsOpen={handleIsOpen}
      isOpen={isOpen}
    >
      {children}
    </FilterSheet>
  );
};

interface OptionalFilters {
  filter: Filter;
  handleFilter(newFilter: Filter): void;
}

const OptionalFilters = ({ filter, handleFilter }: OptionalFilters) => {
  const { data } = useProductFilterList({
    categoryId: filter.categoryId as number,
    brandId: filter.brandId as number,
    productCategoryId: filter.productCategoryId as number,
  });

  const optionMetaById = useMemo(() => getOptionMetaById(data), [data]);

  const handleSelectOption = (id: number) => {
    const meta = optionMetaById[id];
    const currentIds = Array.isArray(filter.optionIdList)
      ? (filter.optionIdList as number[])
      : [];

    if (!meta) {
      handleFilter({ optionIdList: [id] });
      return;
    }

    const next = [
      ...currentIds.filter(
        (currentId) => optionMetaById[currentId]?.group !== meta.group,
      ),
      id,
    ];

    const uniqueNext = Array.from(new Set(next));

    handleFilter({ optionIdList: uniqueNext });
  };

  return (
    <Options
      data={data ?? []}
      handleSelectOption={handleSelectOption}
      selectedOpionIds={
        Array.isArray(filter.optionIdList)
          ? (filter.optionIdList as number[])
          : []
      }
    />
  );
};

export default ProductFilterSheet;
