import type { ProductFilter } from "@shared/services/product";

import { Input } from "@seoul-moment/ui";

interface RadioOptionProps {
  name: string;
  options: ProductFilter["optionValueList"];
}

export function RadioOption({ name, options }: RadioOptionProps) {
  return (
    <div className="flex flex-wrap">
      {options.map((option) => (
        <div
          className="flex w-[50%] items-center justify-between px-[14px] py-[16px]"
          key={option.optionId}
        >
          <div className="flex gap-[4px]">
            <Input name={name} type="radio" />
            <label className="text-body-3 whitespace-pre">{option.value}</label>
          </div>
          {option.colorCode && (
            <div
              className="h-[16px] w-[16px] rounded-full border"
              style={{
                backgroundColor: option.colorCode,
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}
