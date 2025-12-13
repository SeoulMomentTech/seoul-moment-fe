import type { OptionInfo } from "@shared/services/product";

import { GridOption } from "./GridOption";
import { RadioOption } from "./RadioOption";

interface OptionRendererProps {
  option: OptionInfo;
  selectedOptionIds: number[];
  handleSelectOption(id: number): void;
}

export function OptionRenderer({
  option,
  selectedOptionIds,
  handleSelectOption,
}: OptionRendererProps) {
  const assertOptionType = (x: never): never => {
    throw new Error(`Unhandled option type: ${x}`);
  };

  switch (option.type) {
    case "GRID":
      return (
        <GridOption
          handleSelectOption={handleSelectOption}
          options={option.optionValueList}
          selectedOptionIds={selectedOptionIds}
        />
      );
    case "RADIO":
      return (
        <RadioOption
          handleSelectOption={handleSelectOption}
          name={option.title}
          options={option.optionValueList}
          selectedOptionIds={selectedOptionIds}
        />
      );
    default:
      return assertOptionType(option);
  }
}
