import type { ProductFilter } from "@shared/services/product";

import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@seoul-moment/ui";

import { OptionRenderer } from "./OptionRenderer";

interface OptionsProps {
  data: ProductFilter[];
  selectedOpionIds: number[];
  handleSelectOption(id: number): void;
}

export default function Options({
  data,
  selectedOpionIds,
  handleSelectOption,
}: OptionsProps) {
  return (
    <>
      {data.map((option) => (
        <AccordionItem
          className="border-b-black/20"
          key={option.title}
          value={option.title}
        >
          <AccordionTrigger>{option.title}</AccordionTrigger>
          <AccordionContent>
            <OptionRenderer
              handleSelectOption={handleSelectOption}
              option={option}
              selectedOptionIds={selectedOpionIds}
            />
          </AccordionContent>
        </AccordionItem>
      ))}
    </>
  );
}
