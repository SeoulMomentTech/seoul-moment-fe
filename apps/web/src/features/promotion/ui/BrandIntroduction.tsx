"use client";

import { Share2Icon } from "lucide-react";

import Image from "next/image";
import { useTranslations } from "next-intl";

import { useModal } from "@shared/lib/hooks";
import { useUserAuthStore } from "@shared/lib/hooks/useUserAuthStore";
import type {
  GetBrandPromotionBrandDetailResponse,
  GetBrandPromotionResponse,
} from "@shared/services/brandPromotion";

import { Link } from "@/i18n/navigation";
import { LikeCount } from "@/widgets/like-count/ui/LikeCount";

import { useBrandLikeToggle } from "@entities/brand";
import { VStack, HStack, cn, Flex } from "@seoul-moment/ui";

import { useBrandPromotionDetailQuery } from "../model/useBrandPromotionDetailQuery";

interface BrandIntroductionProps {
  brand: GetBrandPromotionBrandDetailResponse;
  brandPromotionId: number;
}

export function BrandIntroduction({
  brand: initialBrand,
  brandPromotionId,
}: BrandIntroductionProps) {
  const { openModal } = useModal();
  const t = useTranslations();
  const { isAuthenticated } = useUserAuthStore();

  const { data } = useBrandPromotionDetailQuery({
    brandPromotionId,
    options: {
      initialData: {
        result: true,
        data: { brand: initialBrand } as GetBrandPromotionResponse,
      },
      // SSR fetch는 accessToken 없이 호출되어 isLiked가 항상 false다.
      // 인증된 경우에만 클라이언트에서 즉시 refetch하도록 stale 마킹 + enabled 사용.
      initialDataUpdatedAt: 0,
      enabled: isAuthenticated,
    },
  });
  const brand = data?.brand ?? initialBrand;

  const { liked, count, handleToggleLike } = useBrandLikeToggle({
    brandId: brand.id,
    isLiked: brand.isLiked,
    likeCount: brand.likeCount,
  });

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
              <LikeCount
                active={liked}
                count={count}
                iconSize={24}
                onClick={handleToggleLike}
              />
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
              {t("promotion_brand_notice")}
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
              {t("promotion_brand")}
            </Link>
            <Link
              className={cn(
                "flex items-center justify-center rounded-sm border",
                "text-body-2 h-12 w-[124px] border-neutral-200 font-semibold max-sm:flex-1",
                "max-sm:text-body-3 max-sm:h-[38px] max-sm:w-[155px]",
              )}
              href={`/product?brandId=${brand.id}`}
            >
              {t("shop")}
            </Link>
          </Flex>
        </VStack>
      </div>
    </section>
  );
}
