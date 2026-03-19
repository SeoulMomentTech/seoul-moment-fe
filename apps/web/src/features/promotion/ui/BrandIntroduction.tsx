"use client";

import { HeartIcon, Share2Icon } from "lucide-react";

import Image from "next/image";

import { useModal } from "@shared/lib/hooks";
import type { GetBrandPromotionBrandDetailResponse } from "@shared/services/brandPromotion";

import { Link } from "@/i18n/navigation";

import { VStack, HStack, cn, Flex } from "@seoul-moment/ui";

interface BrandIntroductionProps {
  brand: GetBrandPromotionBrandDetailResponse;
}

export function BrandIntroduction({ brand }: BrandIntroductionProps) {
  const { openModal } = useModal();

  return (
    <section
      className={cn(
        "w-7xl mx-auto bg-white py-10",
        "max-sm:w-full max-sm:py-10",
      )}
    >
      <div className="mx-auto max-w-[846px] px-4 max-sm:px-5">
        <VStack align="center" className="max-sm:items-start" gap={30}>
          {/* Header row for mobile / Top right for desktop */}
          <div className="flex w-full justify-end max-sm:items-center max-sm:justify-between">
            <span className="text-body-5 hidden font-semibold text-neutral-800/80 max-sm:block">
              {brand.name}
            </span>
            <HStack align="center" gap={10}>
              <HStack align="center" className="text-black" gap={4}>
                <HeartIcon size={24} />
                <span className="text-body-4 font-normal">
                  {brand.likeCount > 999 ? "999+" : brand.likeCount}
                </span>
              </HStack>
              <button
                className="text-black outline-none"
                onClick={() => openModal("share")}
                type="button"
              >
                <Share2Icon size={24} />
              </button>
            </HStack>
          </div>

          {/* Brand Titles */}
          <VStack
            align="center"
            className="text-center max-sm:items-start max-sm:text-left"
            gap={16}
          >
            <span className="text-body-3 font-semibold text-neutral-800 max-sm:hidden">
              {brand.name}
            </span>
            <div className="relative h-20 w-[153px]">
              <Image
                alt={brand.name}
                className="object-contain"
                fill
                sizes="153px"
                src={brand.profileImageUrl}
              />
            </div>
          </VStack>

          {/* Description */}
          <VStack
            align="center"
            className="text-center max-sm:items-start max-sm:text-left"
            gap={20}
          >
            <p className="text-body-3 max-w-[846px] whitespace-pre-wrap leading-normal text-neutral-800">
              {brand.description}
            </p>
            <p className="text-body-5 w-full leading-normal text-neutral-400">
              *기획전 운영 상품의 최대 할인율은 품절 또는 상황에 따라 변동 될 수
              있습니다.
            </p>
          </VStack>

          {/* Actions */}
          <Flex className="max-sm:w-full" gap={10}>
            <Link
              className={cn(
                "flex items-center justify-center rounded-sm border",
                "text-body-2 h-12 w-[124px] border-neutral-200 font-semibold max-sm:flex-1",
                "max-sm:text-body-3 max-sm:h-[38px] max-sm:w-[155px]",
              )}
              href={`/brand/${brand.id}`}
            >
              브랜드 소개
            </Link>
            <Link
              className={cn(
                "flex items-center justify-center rounded-sm border",
                "text-body-2 h-12 w-[124px] border-neutral-200 font-semibold max-sm:flex-1",
                "max-sm:text-body-3 max-sm:h-[38px] max-sm:w-[155px]",
              )}
              href={`/product?brandId=${brand.id}`}
            >
              Shop
            </Link>
          </Flex>
        </VStack>
      </div>
    </section>
  );
}
