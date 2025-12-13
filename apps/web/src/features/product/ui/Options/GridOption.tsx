import type { ProductFilter } from "@shared/services/product";

import { Button, cn } from "@seoul-moment/ui";

interface GridOptionProps {
  options: ProductFilter["optionValueList"];
  selectedOptionIds: number[];
  handleSelectOption(id: number): void;
}

export function GridOption({
  options,
  selectedOptionIds,
  handleSelectOption,
}: GridOptionProps) {
  return (
    <div className="flex gap-[10px]">
      {options.map((option) => {
        const selected = selectedOptionIds.includes(option.optionId);

        return (
          <Button
            className={cn("h-[46px] flex-1", selected && "bg-black text-white")}
            key={`${option.value}-${option.optionId}`}
            onClick={() => handleSelectOption(option.optionId)}
            size="sm"
            variant="outline"
          >
            {option.value}
          </Button>
        );
      })}
    </div>
  );
}
