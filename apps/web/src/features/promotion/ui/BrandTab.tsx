"use client";

import { useLayoutEffect } from "react";

import Image from "next/image";
import { notFound } from "next/navigation";

import { useMediaQuery } from "@shared/lib/hooks";

import { useRouter } from "@/i18n/navigation";

import { Flex, HStack, cn } from "@seoul-moment/ui";

import { useBrandPromotionListQuery } from "../model/useBrandPromotionListQuery";

interface BrandTabProps {
  promotionId: number;
  selectedId: number;
}

export function BrandTab({ promotionId, selectedId }: BrandTabProps) {
  const isMobile = useMediaQuery("(max-width: 40rem)", false);
  const navigate = useRouter();
  const { data } = useBrandPromotionListQuery({ id: promotionId });

  useLayoutEffect(() => {
    if (!data) return;

    const isValidBrandId = data.list.some(
      (brand) => brand.brandId === selectedId,
    );
    if (!isValidBrandId) {
      notFound();
    }
  }, [data, selectedId]);

  return (
    <nav className="border-b border-black/10 bg-white">
      <Flex className={cn("w-7xl mx-auto", "max-sm:w-full")}>
        <HStack
          align={isMobile ? "start" : "center"}
          className={cn(
            "h-full w-full",
            "no-scrollbar max-sm:justify-start max-sm:gap-5 max-sm:overflow-x-auto max-sm:px-5",
          )}
          gap={isMobile ? 20 : 50}
        >
          {data?.list.map((brand) => {
            const isActive = brand.brandId === selectedId;
            return (
              <button
                className={cn(
                  "flex shrink-0 flex-col items-center gap-4 border-b-2 py-5 outline-none transition-all",
                  isActive ? "border-black" : "border-transparent",
                )}
                key={brand.id}
                onClick={() =>
                  navigate.push(
                    `/promotion/${promotionId}/brand/${brand.brandId}`,
                  )
                }
                type="button"
              >
                <div className="relative h-[50px] w-[50px] overflow-hidden rounded-full border border-black/10 max-sm:size-10">
                  <Image
                    alt={brand.name}
                    className="object-cover"
                    fill
                    sizes="(max-width: 640px) 40px, 50px"
                    src={brand.profileImageUrl}
                  />
                </div>
                <span
                  className={cn(
                    "text-body-3 leading-none tracking-tight",
                    isActive
                      ? "font-bold text-black"
                      : "font-medium text-black/40",
                  )}
                >
                  {brand.name}
                </span>
              </button>
            );
          })}
        </HStack>
      </Flex>
    </nav>
  );
}
