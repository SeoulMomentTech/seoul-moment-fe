import { useTranslations } from "next-intl";

import type { Filter } from "@widgets/filter-sheet/ui/FilterSheet";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Button,
  cn,
} from "@seoul-moment/ui";

import useBrandFilter from "../../model/useBrandFilter";

interface BrandFilterProps {
  filter: Filter;
  handleFilter(newFilter: Filter): void;
}

const BrandFilter = ({ filter, handleFilter }: BrandFilterProps) => {
  const { data: brandFilters } = useBrandFilter();
  const t = useTranslations();

  return (
    <AccordionItem className="border-b-black/20" value="brand">
      <AccordionTrigger>{t("product_brand")}</AccordionTrigger>
      <AccordionContent>
        <Accordion collapsible type="single">
          {brandFilters.map((item) => (
            <AccordionItem
              className="pl-[14px]"
              hideBorder
              key={item.name}
              value={item.filter}
            >
              <AccordionTrigger className="font-semibold">
                {item.name}
              </AccordionTrigger>
              {item.brandNameList.length > 0 && (
                <AccordionContent className="flex flex-col pb-0 pl-[12px]">
                  {item.brandNameList.map((brand) => (
                    <Button
                      className={cn(
                        "justify-start px-0 py-[10px] text-start text-black/40",
                        "hover:bg-transparent hover:text-black",
                        filter.brandId === brand.id && "text-black",
                      )}
                      key={brand.id}
                      onClick={() => handleFilter({ brandId: brand.id })}
                      size="sm"
                      variant="ghost"
                    >
                      {brand.name}
                    </Button>
                  ))}
                </AccordionContent>
              )}
            </AccordionItem>
          ))}
        </Accordion>
      </AccordionContent>
    </AccordionItem>
  );
};

export default BrandFilter;
