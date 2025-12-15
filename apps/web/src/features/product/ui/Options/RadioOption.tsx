import type { ProductFilter } from "@shared/services/product";

import { RadioGroup, RadioGroupItem, cn } from "@seoul-moment/ui";

interface RadioOptionProps {
  name: string;
  options: ProductFilter["optionValueList"];
  selectedOptionIds: number[];
  handleSelectOption(id: number): void;
}

export function RadioOption({
  name,
  options,
  selectedOptionIds,
  handleSelectOption,
}: RadioOptionProps) {
  const option = options.find(({ optionId }) =>
    selectedOptionIds.includes(optionId),
  );

  return (
    <RadioGroup
      className="flex flex-wrap justify-between"
      name={name}
      onValueChange={(value) => handleSelectOption(Number(value))}
      value={option ? option.optionId.toString() : undefined}
    >
      {options.map((option) => {
        return (
          <label
            className={cn(
              "flex w-[48%] items-center justify-between px-[14px] py-[16px]",
              "max-sm:w-full",
            )}
            htmlFor={`${option.optionId}`}
            key={option.optionId}
          >
            <div className="flex items-center gap-[4px]">
              <RadioGroupItem
                id={`${option.optionId}`}
                value={option.optionId.toString()}
              />
              <span className="text-body-3 whitespace-pre">{option.value}</span>
            </div>
            {option.colorCode && (
              <div
                className="h-[16px] w-[32px] border border-black/40"
                style={{
                  backgroundColor: option.colorCode,
                }}
              />
            )}
          </label>
        );
      })}
    </RadioGroup>
  );
}
