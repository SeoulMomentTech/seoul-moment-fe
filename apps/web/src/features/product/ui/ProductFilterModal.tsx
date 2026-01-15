import { useMemo, useState } from "react";

import { useTranslations } from "next-intl";

import { cn } from "@shared/lib/style";
import { mergeOptionIdList } from "@shared/lib/utils/filter";
import type { OptionIdListValue } from "@shared/lib/utils/filter";
import type { Filter } from "@widgets/filter-sheet/ui/FilterSheet";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@seoul-moment/ui";

import Options from "./Options";
import { getOptionMetaById } from "../lib/getOptionMetaById";
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
  const t = useTranslations();

  const optionMetaById = useMemo(() => getOptionMetaById(data), [data]);

  const handleSelectOption = (id: number) => {
    const meta = optionMetaById[id];

    setInstantFilter((prev) => {
      const currentIds = Array.isArray(prev.optionIdList)
        ? (prev.optionIdList as number[])
        : [];

      if (!meta) {
        return mergeOptionIdList(prev, id);
      }

      // 모든 타입에서 같은 그룹의 기존 선택을 제거하고 새 선택으로 대체
      const next = [
        ...currentIds.filter(
          (currentId) => optionMetaById[currentId]?.group !== meta.group,
        ),
        id,
      ];

      const uniqueNext = Array.from(new Set(next));

      return {
        ...prev,
        optionIdList: uniqueNext,
      };
    });
  };

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
    handleUpdateFilter(instantFilter)();
    handleIsOpen(false);
  };

  const handleCloseFilter = () => {
    handleIsOpen(false);
  };

  return (
    <Dialog onOpenChange={handleIsOpen} open={isOpen}>
      <DialogContent className="w-[522px] pt-[32px]">
        <DialogHeader>
          <DialogTitle className="text-title-4 text-center font-semibold">
            {t("select_filter")}
          </DialogTitle>
          <DialogDescription className="sr-only" />
        </DialogHeader>
        <div className="relative flex flex-col gap-[32px]">
          <div className="scrollbar-medium max-h-[550px] min-h-[300px] overflow-y-auto overflow-x-hidden">
            <Accordion defaultValue={["category"]} type="multiple">
              {filter.categoryId == null && (
                <AccordionItem className="border-b-black/20" value="category">
                  <AccordionTrigger>{t("category")}</AccordionTrigger>
                  <AccordionContent className="flex flex-col pb-0">
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
              <Options
                data={data ?? []}
                handleSelectOption={handleSelectOption}
                selectedOptionIds={
                  (instantFilter?.optionIdList as number[]) ?? []
                }
              />
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
