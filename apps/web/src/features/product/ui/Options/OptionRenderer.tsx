import type { OptionInfo } from "@shared/services/product";

import { GridOption } from "./GridOption";
import { RadioOption } from "./RadioOption";

interface OptionRendererProps {
  option: OptionInfo;
}

export function OptionRenderer({ option }: OptionRendererProps) {
  const assertOptionType = (x: never): never => {
    throw new Error(`Unhandled option type: ${x}`);
  };

  switch (option.type) {
    case "grid":
      return <GridOption options={option.optionValueList} />;
    case "radio":
      return (
        <RadioOption name={option.title} options={option.optionValueList} />
      );
    default:
      return assertOptionType(option);
  }
}
