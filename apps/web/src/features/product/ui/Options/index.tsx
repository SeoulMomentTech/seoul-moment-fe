import type { ProductFilter } from "@shared/services/product";

import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@seoul-moment/ui";

import { OptionRenderer } from "./OptionRenderer";

interface OptionsProps {
  data: ProductFilter[];
}

export default function Options({ data }: OptionsProps) {
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
              option={{
                ...option,
                type: option.title === "성별" ? "grid" : "radio",
              }}
            />
          </AccordionContent>
        </AccordionItem>
      ))}
    </>
  );
}
