"use client";

import { HeartIcon, StarIcon } from "lucide-react";

import Image from "next/image";

import type { GetBrandPromotionProductResponse } from "@shared/services/brandPromotion";

import { Link } from "@/i18n/navigation";

import { VStack, HStack, cn, Flex } from "@seoul-moment/ui";

interface BrandSpecialEventProps {
  brandId: number;
  products: GetBrandPromotionProductResponse[];
}

export function BrandSpecialEvent({
  products,
  brandId,
}: BrandSpecialEventProps) {
  if (!products.length) return null;

  return (
    <section className="w-full border-b border-black/10 bg-white py-[100px] max-sm:py-[60px]">
      <div className="max-sm:min-w-auto min-w-7xl mx-auto max-w-[1920px] px-4 max-sm:px-5">
        <VStack align="center" className="w-full" gap={50}>
          <h2 className="text-title-2 max-sm:text-title-3 text-center font-bold text-black">
            스페셜 이벤트
          </h2>

          <div
            className={cn(
              "grid w-full max-w-7xl grid-cols-4 gap-x-5 gap-y-10",
              "max-sm:grid-cols-2 max-sm:gap-y-5",
            )}
          >
            {products.map((product) => (
              <Link href={`/product/${product.id}`} key={product.id}>
                <SpecialProductCard {...product} />
              </Link>
            ))}
          </div>

          <Link
            className={cn(
              "flex items-center justify-center rounded-md border",
              "text-body-2 h-12 border-neutral-200 px-10 font-semibold",
              "max-sm:w-full",
            )}
            href={`/product?brandId=${brandId}`}
          >
            더보기
          </Link>
        </VStack>
      </div>
    </section>
  );
}

function SpecialProductCard(props: GetBrandPromotionProductResponse) {
  return (
    <VStack className="w-full" gap={16}>
      <div
        className={cn(
          "aspect-305/407 relative w-[305px] overflow-hidden",
          "max-sm:w-full",
        )}
      >
        <Image
          alt={props.productName}
          className="object-cover"
          fill
          src={props.imageUrl}
        />
        <button
          className="absolute right-3 top-3 z-10 p-1 outline-none"
          type="button"
        >
          <HeartIcon
            className={cn("size-6 text-white transition-colors")}
            strokeWidth={1.5}
          />
        </button>
      </div>
      <Flex className="w-full" direction="column" gap={16}>
        <Flex direction="column" gap={16}>
          <Flex direction="column" gap={10}>
            <span className="text-body-5 font-semibold text-neutral-800">
              {props.brandName}
            </span>
            <p className="text-body-3 font-normal leading-tight text-black">
              {props.productName}
            </p>
          </Flex>
          <span className="text-body-2 max-sm:text-body-3 font-semibold text-black">
            {props.price}
          </span>
        </Flex>

        <HStack gap={10}>
          <HStack align="center" className="text-neutral-400" gap={4}>
            <HeartIcon className="size-4" strokeWidth={1.5} />
            <span className="text-body-4">{props.like}</span>
          </HStack>
          <HStack align="center" className="text-neutral-400" gap={4}>
            <StarIcon className="size-4" strokeWidth={1.5} />
            <span className="text-body-4">
              {props.reviewAverage}({props.review})
            </span>
          </HStack>
        </HStack>
      </Flex>
    </VStack>
  );
}
