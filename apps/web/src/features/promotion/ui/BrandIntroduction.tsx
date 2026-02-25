"use client";

import { HeartIcon, Share2Icon } from "lucide-react";

import Image from "next/image";

import { VStack, HStack, Button, cn } from "@seoul-moment/ui";

interface BrandIntroductionProps {
  brandNameEn?: string;
  brandNameKo?: string;
  description?: string;
  footnote?: string;
  likeCount?: number | string;
  logoImageUrl?: string;
}

export function BrandIntroduction({
  brandNameEn = "FUN FROM FUN",
  brandNameKo = "펀프롬펀",
  description = "즐거움을 지향하는 펀프롬펀은 키치하고 사랑스러운 디자인을 선보입니다. 위트 있고 독창적인 스타일로 입는 순간 또 다른 즐거움 경험해보세요.",
  footnote = "*기획전 운영 상품의 최대 할인율은 품절 또는 상황에 따라 변동 될 수 있습니다.",
  likeCount = "999+",
  logoImageUrl = "https://www.figma.com/api/mcp/asset/da170048-d0a1-4a27-8460-712f73d424ad",
}: BrandIntroductionProps) {
  return (
    <section
      className={cn(
        "mx-auto w-[1280px] bg-white py-[40px]",
        "max-sm:w-full max-sm:py-[40px]",
      )}
    >
      <div className="mx-auto max-w-[846px] px-4 max-sm:px-5">
        <VStack align="center" className="max-sm:items-start" gap={30}>
          {/* Header row for mobile / Top right for desktop */}
          <div className="flex w-full justify-end max-sm:items-center max-sm:justify-between">
            <span className="text-body-5 hidden font-semibold text-neutral-800/80 max-sm:block">
              {brandNameKo}
            </span>
            <HStack align="center" gap={10}>
              <HStack align="center" className="text-black" gap={4}>
                <HeartIcon size={24} />
                <span className="text-body-4 font-normal">{likeCount}</span>
              </HStack>
              <button className="text-black outline-none" type="button">
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
              {brandNameKo}
            </span>
            {logoImageUrl ? (
              <div className="relative h-[80px] w-[153px]">
                <Image
                  alt={brandNameEn}
                  className="object-contain"
                  fill
                  src={logoImageUrl}
                />
              </div>
            ) : (
              <h2 className="text-title-2 max-sm:text-title-3 font-semibold leading-none text-neutral-800">
                {brandNameEn}
              </h2>
            )}
          </VStack>

          {/* Description */}
          <VStack
            align="center"
            className="text-center max-sm:items-start max-sm:text-left"
            gap={20}
          >
            <p className="text-body-3 max-w-[846px] whitespace-pre-wrap leading-normal text-neutral-800">
              {description}
            </p>
            <p className="text-body-5 w-full leading-normal text-neutral-400">
              {footnote}
            </p>
          </VStack>

          {/* Actions */}
          <HStack className="max-sm:w-full" gap={10}>
            <Button
              className="text-body-2 h-[48px] w-[120px] border-neutral-200 font-semibold max-sm:flex-1"
              variant="outline"
            >
              브랜드 소개
            </Button>
            <Button className="text-body-2 h-[48px] w-[120px] bg-black font-semibold text-white max-sm:flex-1">
              Shop
            </Button>
          </HStack>
        </VStack>
      </div>
    </section>
  );
}
