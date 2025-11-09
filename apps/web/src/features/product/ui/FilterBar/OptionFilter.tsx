import { Button } from "@seoul-moment/ui";
import { FilterIcon } from "@shared/ui/icon";

interface OptionFilterProps {
  onClick(): void;
}

export default function OptionFilter({ onClick }: OptionFilterProps) {
  return (
    <Button
      className="flex h-full gap-[4px] p-0 hover:bg-transparent"
      onClick={onClick}
      size="sm"
      variant="ghost"
    >
      <FilterIcon />
      필터
    </Button>
  );
}
