import type { ProductFilter } from "@shared/services/product";

import { Input } from "@seoul-moment/ui";

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
  return (
    <div className="flex flex-wrap">
      {options.map((option) => {
        const isChecked = selectedOptionIds.includes(option.optionId);

        return (
          <label
            className="flex w-[50%] items-center justify-between px-[14px] py-[16px]"
            htmlFor={`${option.optionId}`}
            key={option.optionId}
          >
            <div className="flex gap-[4px]">
              <Input
                checked={isChecked}
                id={`${option.optionId}`}
                name={name}
                onChange={(e) => handleSelectOption(Number(e.target.value))}
                type="radio"
                value={option.optionId}
              />
              <span className="text-body-3 whitespace-pre">{option.value}</span>
            </div>
            {option.colorCode && (
              <div
                className="h-[16px] w-[16px] rounded-full border"
                style={{
                  backgroundColor: option.colorCode,
                }}
              />
            )}
          </label>
        );
      })}
    </div>
  );
}
