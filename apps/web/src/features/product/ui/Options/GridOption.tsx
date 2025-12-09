import type { ProductFilter } from "@shared/services/product";

import { Button } from "@seoul-moment/ui";

interface GridOptionProps {
  options: ProductFilter["optionValueList"];
}

export function GridOption({ options }: GridOptionProps) {
  return (
    <div className="flex gap-[10px]">
      {options.map((option) => (
        <Button
          className="h-[46px] flex-1"
          key={`${option.value}-${option.optionId}`}
          size="sm"
          variant="outline"
        >
          {option.value}
        </Button>
      ))}
    </div>
  );
}
