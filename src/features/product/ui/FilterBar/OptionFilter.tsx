import { Button } from "@shared/ui/button";
import { FilterIcon } from "@shared/ui/icon";

export default function OptionFilter() {
  return (
    <Button
      className="flex h-full gap-[4px] p-0 hover:bg-transparent"
      size="sm"
      variant="ghost"
    >
      <FilterIcon />
      필터
    </Button>
  );
}
