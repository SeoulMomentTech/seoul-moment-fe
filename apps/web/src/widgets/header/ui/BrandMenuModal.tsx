"use client";

import { XIcon } from "lucide-react";

import { useTranslations } from "next-intl";

import { useAppQuery, useMediaQuery } from "@shared/lib/hooks";
import { getBrandFilter } from "@shared/services/brand";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from "@shared/ui/sheet";

import { Link } from "@/i18n/navigation";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@seoul-moment/ui";

interface BrandMenuModalProps {
  isOpen: boolean;
  onOpenChange(open: boolean): void;
  animate?: boolean;
}

const filterName: Record<string, string> = {
  A_TO_D: "A ~ D",
  E_TO_H: "E ~ H",
  I_TO_L: "I ~ L",
  M_TO_P: "M ~ P",
  Q_TO_T: "Q ~ T",
  U_TO_Z: "U ~ Z",
};

export function BrandMenuModal({
  isOpen,
  onOpenChange,
  animate = true,
}: BrandMenuModalProps) {
  const isMobile = useMediaQuery("(max-width: 40rem)", false);
  const t = useTranslations();
  const { data: brandGroups = [] } = useAppQuery({
    queryKey: ["brand-filter"],
    queryFn: () => getBrandFilter(),
    select: (res) => res.data.list,
    enabled: isOpen,
  });

  if (!isMobile) return null;

  return (
    <Sheet onOpenChange={onOpenChange} open={isOpen}>
      <SheetContent
        animate={animate}
        className="max-w-screen flex h-full w-full flex-col gap-0 p-0"
        hideClose
        side="left"
      >
        <SheetHeader className="relative flex h-[56px] items-center justify-center border-b border-black/5 px-[20px] py-0">
          <SheetClose className="absolute left-[20px] flex h-full cursor-pointer items-center">
            <XIcon className="size-5 text-black" />
          </SheetClose>
          <SheetTitle className="text-body-2 font-semibold">
            {t("brand")}
          </SheetTitle>
          <SheetDescription className="sr-only" />
        </SheetHeader>
        <div className="scrollbar-hide flex-1 overflow-y-auto px-[20px] py-[10px]">
          <Accordion collapsible type="single">
            {brandGroups
              .filter((group) => group.brandNameList.length > 0)
              .map((group) => (
                <AccordionItem
                  className="border-b border-b-black/10 last:border-b-0"
                  key={group.filter}
                  value={group.filter}
                >
                  <AccordionTrigger className="text-body-2 font-semibold text-black hover:no-underline">
                    {filterName[group.filter] || group.filter}
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="flex flex-col pb-[10px] pl-[10px]">
                      {group.brandNameList.map((brand) => (
                        <li key={brand.id}>
                          <Link
                            className="text-body-3 block py-[8px] text-black/60 transition-colors hover:font-medium hover:text-black"
                            href={`/product?brandId=${brand.id}`}
                            onClick={() => onOpenChange(false)}
                          >
                            {brand.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              ))}
          </Accordion>
        </div>
      </SheetContent>
    </Sheet>
  );
}
