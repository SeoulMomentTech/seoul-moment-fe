import { ChevronDown } from "lucide-react";

import { cn } from "@shared/lib/style";
import type { SortOption } from "@shared/services/product";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@shared/ui/dropdown-menu";

import { Button, Skeleton } from "@seoul-moment/ui";

import useProductFilter from "../../model/useProductFilter";
import useProductSortFilter from "../../model/useProductSortFilter";

export function SortFilter() {
  const { data } = useProductSortFilter();
  const { filter, handleUpdateFilter } = useProductFilter();

  const handleClick = ({ sort, sortColumn }: SortOption) => {
    const newFilter = {
      sort,
      sortColumn,
    };

    handleUpdateFilter(newFilter)();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className={cn(
            "flex h-full gap-[4px] p-0 hover:bg-transparent",
            "max-sm:text-body-3",
          )}
          size="sm"
          variant="ghost"
        >
          <span>
            {
              data.sortMap[
                filter?.sortColumn && filter?.sort
                  ? `${filter.sortColumn}_${filter.sort}`
                  : "createDate_DESC"
              ].name
            }
          </span>
          <ChevronDown height={16} width={16} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="focus:ring-transparent! text-body-3 min-w-[66px] bg-white max-md:min-w-[120px]"
        side="bottom"
      >
        <DropdownMenuGroup>
          {data.list.map((item) => (
            <DropdownMenuItem key={item.id} onClick={() => handleClick(item)}>
              {item.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function SortFilterSkeleton() {
  return (
    <div className="flex items-center gap-[6px]">
      <Skeleton
        className={cn(
          "h-[32px] w-[110px] rounded-[6px]",
          "max-sm:h-[30px] max-sm:w-[88px]",
        )}
      />
      <Skeleton className="h-[16px] w-[16px] rounded-full" />
    </div>
  );
}
