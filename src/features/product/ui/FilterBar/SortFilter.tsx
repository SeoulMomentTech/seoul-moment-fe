import { ChevronDown } from "lucide-react";
import { cn } from "@shared/lib/style";
import { Button } from "@shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@shared/ui/dropdown-menu";

export default function SortFilter() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className={cn(
            "flex h-full gap-[4px] p-0 hover:bg-transparent",
            "max-sm:text-[14px]",
          )}
          size="sm"
          variant="ghost"
        >
          <span>인기순</span>
          <ChevronDown height={16} width={16} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="min-w-[66px] bg-white text-[14px] focus:ring-transparent! max-md:min-w-[120px]"
        side="bottom"
      >
        <DropdownMenuGroup>
          <DropdownMenuItem>날짜순</DropdownMenuItem>
          <DropdownMenuItem>가격순</DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
