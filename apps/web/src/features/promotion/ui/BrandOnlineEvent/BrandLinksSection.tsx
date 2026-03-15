import Image from "next/image";

import type { GetBrandPromotionBrandDetailResponse } from "@shared/services/brandPromotion";

import { Link } from "@/i18n/navigation";

import { VStack, cn, Flex } from "@seoul-moment/ui";

interface BrandLinksSectionProps {
  colorCode: string;
  brand: GetBrandPromotionBrandDetailResponse;
  logoImage: string;
}

export function BrandLinksSection({
  brand,
  logoImage,
}: BrandLinksSectionProps) {
  return (
    <VStack
      align="center"
      className="w-full py-[74px] max-sm:px-5 max-sm:py-20"
      gap={50}
      style={{
        backgroundColor: brand.colorCode,
      }}
    >
      <div className="relative h-[100px] w-[413px] max-sm:h-[68px] max-sm:w-[288px]">
        <Image
          alt="Brand Logo"
          className="object-contain"
          fill
          src={logoImage}
        />
      </div>
      <Flex
        className="w-full max-w-[413px] max-sm:max-w-full"
        gap={10}
        justify="center"
      >
        <Link
          className={cn(
            "flex w-[124px] items-center justify-center rounded-sm border font-semibold",
            "h-[52px] border-black/20 bg-white px-5 py-4 text-black hover:bg-neutral-50",
            "max-sm:w-[155px]",
          )}
          href={`/brand/${brand.id}`}
        >
          브랜드 소개
        </Link>
        <Link
          className={cn(
            "flex w-[124px] items-center justify-center rounded-sm border font-semibold",
            "h-[52px] border-black/20 bg-white px-5 py-4 text-black hover:bg-neutral-50",
            "max-sm:w-[155px]",
          )}
          href={`/product?brandId=${brand.id}`}
        >
          Shop
        </Link>
      </Flex>
    </VStack>
  );
}
