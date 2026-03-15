"use client";

import type { GetBrandPromotionSectionResponse } from "@shared/services/brandPromotion";

import { useMediaQuery } from "@/shared/lib/hooks";

import { VStack, cn } from "@seoul-moment/ui";

import { ImageContents } from "./ImageContents";

interface BrandLookbookProps {
  sectionList: GetBrandPromotionSectionResponse[];
}

export function BrandLookbook({ sectionList }: BrandLookbookProps) {
  const isMobile = useMediaQuery("(max-width: 40rem)", false);

  return (
    <section
      className={cn(
        "min-w-7xl mx-auto overflow-hidden bg-neutral-50 py-[100px]",
        "max-sm:min-w-auto max-sm:py-[60px]",
      )}
    >
      <VStack align="center" className="w-full" gap={isMobile ? 60 : 100}>
        {sectionList.map((section) => (
          <ImageContents
            imageList={section.imageUrlList}
            key={section.id}
            type={section.type}
          />
        ))}
      </VStack>
    </section>
  );
}
