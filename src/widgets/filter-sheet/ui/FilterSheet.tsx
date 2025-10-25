import type { ReactNode } from "react";
import { useState, type PropsWithChildren } from "react";
import useProductFilter from "@features/product/model/useProductFilter";
import { cn } from "@shared/lib/style";

import { Button } from "@shared/ui/button";
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

type Filter = Record<string, string | number | null | undefined>;

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

  const handleApplyFilter = () => {
    handleUpdateFilter(filter)();
    handleIsOpen(false);
  };

  const handleCloseFilter = () => {
    handleIsOpen(false);
  };

  const handleFilter = (newFilter: Filter) => {
    setFilter((prev) => ({
      ...prev,
      ...newFilter,
    }));
  };

  return (
    <Sheet onOpenChange={(isOpen) => handleIsOpen(isOpen)} open={isOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent
        className="flex h-full w-full max-w-screen gap-0 pb-[180px]"
        hideClose
        side="top"
      >
        <SheetHeader className="flex pt-[20px] pb-[30px] text-center">
          <span className="font-semibold">필터</span>
          <SheetTitle className="sr-only" />
          <SheetDescription className="sr-only" />
        </SheetHeader>
        <div className="flex h-full flex-col">
          <div className="border-b border-b-black/20 pb-[10px]">
            <div className="flex justify-between px-[20px]">
              <span>검색 결과</span>
              <button onClick={handleResetFilter} type="button">
                <RefreshIcon />
              </button>
            </div>
          </div>
          <div className="flex h-full flex-col justify-between overflow-auto">
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
