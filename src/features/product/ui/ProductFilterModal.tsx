import { useState } from "react";
import type { OptionIdListValue } from "@/shared/lib/utils/filter";
import { mergeOptionIdList } from "@/shared/lib/utils/filter";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/ui/accordion";
import type { Filter } from "@/widgets/filter-sheet/ui/FilterSheet";
import { cn } from "@shared/lib/style";
import { Button } from "@shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@shared/ui/dialog";
import useCategories from "../model/useCategories";
import useProductFilter from "../model/useProductFilter";
import useProductFilterList from "../model/useProductFilterList";

interface ProductFilterModalProps {
  isOpen: boolean;
  handleIsOpen(open: boolean): void;
}

export default function ProductFilterModal({
  isOpen,
  handleIsOpen,
}: ProductFilterModalProps) {
  const { filter, handleUpdateFilter } = useProductFilter();
  const { data: categoriesData } = useCategories();

  const [instantFilter, setInstantFilter] = useState<Filter>(filter);
  const { data } = useProductFilterList({
    categoryId: (instantFilter?.categoryId as number) ?? undefined,
    brandId: filter.brandId,
    productCategoryId: filter.productCategoryId,
  });

  const handleInstantFilter = (newFilter: Filter) => {
    setInstantFilter((prev) => {
      const { optionIdList, ...rest } = newFilter;
      const merged = {
        ...prev,
        ...rest,
      };

      return mergeOptionIdList(merged, optionIdList as OptionIdListValue);
    });
  };

  const handleApplyFilter = () => {
    handleIsOpen(false);
    handleUpdateFilter(instantFilter);
  };

  const handleCloseFilter = () => {
    handleIsOpen(false);
  };

  return (
    <Dialog onOpenChange={handleIsOpen} open={isOpen}>
      <DialogContent className="w-[522px] pt-[32px]">
        <DialogHeader>
          <DialogTitle className="text-title-4 text-center font-semibold">
            필터
          </DialogTitle>
          <DialogDescription className="sr-only" />
        </DialogHeader>
        <div className="relative flex flex-col gap-[32px]">
          <div className="min-h-[300px]">
            <Accordion type="multiple">
              {filter.categoryId == null && (
                <AccordionItem value="category">
                  <AccordionTrigger>카테고리</AccordionTrigger>
                  <AccordionContent>
                    {categoriesData?.map((item) => (
                      <Button
                        className={cn(
                          "justify-start py-[10px] pl-[14px] text-start text-black/40",
                          "hover:bg-transparent hover:text-black",
                          instantFilter.categoryId === item.id && "text-black",
                        )}
                        key={item.id}
                        onClick={() =>
                          handleInstantFilter({ categoryId: item.id })
                        }
                        size="sm"
                        variant="ghost"
                      >
                        {item.name}
                      </Button>
                    ))}
                  </AccordionContent>
                </AccordionItem>
              )}
              {data?.map((item) => (
                <AccordionItem
                  className="border-b-black/20"
                  key={item.title}
                  value={item.title}
                >
                  <AccordionTrigger>{item.title}</AccordionTrigger>
                  <AccordionContent>
                    {item.optionValueList.map((option) => (
                      <div key={option.optionId}>{option.value}</div>
                    ))}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
          <div className={cn("flex justify-center gap-[8px] px-[20px]")}>
            <Button
              className="flex-1"
              onClick={handleCloseFilter}
              variant="outline"
            >
              닫기
            </Button>
            <Button className="flex-1" onClick={handleApplyFilter}>
              적용하기
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
