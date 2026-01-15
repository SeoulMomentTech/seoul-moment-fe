import type { ReactNode } from "react";
import { useState, type PropsWithChildren } from "react";

import { useTranslations } from "next-intl";

import useProductFilter from "@features/product/model/useProductFilter";
import { cn } from "@shared/lib/style";
import {
  mergeOptionIdList,
  type OptionIdListValue,
} from "@shared/lib/utils/filter";
import FixedBox from "@shared/ui/fixed-box";
import { RefreshIcon } from "@shared/ui/icon";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@shared/ui/sheet";

import { Button } from "@seoul-moment/ui";

type FilterValue = number[] | string | number | null | undefined;
export type Filter = Record<string, FilterValue>;

interface FilterSheetProps extends PropsWithChildren {
  isOpen: boolean;
  handleIsOpen(open: boolean): void;
  content:
    | ((filter: Filter, handleFilter: (newFilter: Filter) => void) => ReactNode)
    | ReactNode;
}

const FilterSheet = ({
  children,
  isOpen,
  content,
  handleIsOpen,
}: FilterSheetProps) => {
  const {
    filter: defaultFilter,
    handleUpdateFilter,
    handleResetFilter,
  } = useProductFilter();
  const [filter, setFilter] = useState<Filter>(defaultFilter);
  const t = useTranslations();

  const handleApplyFilter = () => {
    handleUpdateFilter(filter)();
    handleIsOpen(false);
  };

  const handleCloseFilter = () => {
    handleIsOpen(false);
    setFilter({});
  };

  const handleRefresh = () => {
    setFilter({});
    handleResetFilter();
  };

  const handleFilter = (newFilter: Filter) => {
    setFilter((prev) => {
      const { optionIdList, ...rest } = newFilter;
      const merged = {
        ...prev,
        ...rest,
      };

      return mergeOptionIdList(merged, optionIdList as OptionIdListValue);
    });
  };

  return (
    <Sheet onOpenChange={(isOpen) => handleIsOpen(isOpen)} open={isOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent
        className="max-w-screen flex h-full w-full gap-0 pb-[180px]"
        hideClose
        side="top"
      >
        <SheetHeader className="flex pb-[30px] pt-[20px] text-center">
          <span className="font-semibold">{t("select_filter")}</span>
          <SheetTitle className="sr-only" />
          <SheetDescription className="sr-only" />
        </SheetHeader>
        <div className="flex h-full flex-col">
          <div className="border-b border-b-black/20 pb-[10px]">
            <div className="flex justify-between px-[20px]">
              <span>검색 결과</span>
              <Button
                className="h-auto w-auto p-0"
                onClick={handleRefresh}
                type="button"
                variant="ghost"
              >
                <RefreshIcon />
              </Button>
            </div>
          </div>
          <div className="scrollbar-medium flex h-full flex-col justify-between overflow-auto">
            <div className="px-[20px] py-[10px]">
              {typeof content === "function"
                ? content(filter, (filter) => {
                    handleFilter(filter);
                  })
                : content}
            </div>
          </div>
          <FixedBox
            className={cn(
              "flex justify-center gap-[8px] px-[20px] py-[16px]",
              "border-t border-t-black/20",
            )}
            direction="bottom"
          >
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
          </FixedBox>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default FilterSheet;
