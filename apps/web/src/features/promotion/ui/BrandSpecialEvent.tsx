"use client";

import { HeartIcon, StarIcon } from "lucide-react";

import Image from "next/image";

import { VStack, HStack, Button, cn, Flex } from "@seoul-moment/ui";

interface SpecialProduct {
  id: string;
  brandName: string;
  productName: string;
  price: string;
  likeCount: string;
  rating: string;
  reviewCount: string;
  imageUrl: string;
  isLiked?: boolean;
}

const SPECIAL_PRODUCTS: SpecialProduct[] = [
  {
    id: "sp-1",
    brandName: "51퍼센트",
    productName: "TUNNEL LINING TROUSE",
    price: "189,000원",
    likeCount: "21794",
    rating: "4.5",
    reviewCount: "330",
    imageUrl:
      "https://www.figma.com/api/mcp/asset/a21ce7f8-a93f-4585-82d8-15b7ca88b205",
    isLiked: true,
  },
  {
    id: "sp-2",
    brandName: "51퍼센트",
    productName: "TUNNEL LINING TROUSE",
    price: "189,000원",
    likeCount: "21794",
    rating: "4.5",
    reviewCount: "330",
    imageUrl:
      "https://www.figma.com/api/mcp/asset/301761e7-b7fc-4dba-9153-bf2e31ef246f",
  },
  {
    id: "sp-3",
    brandName: "51퍼센트",
    productName: "TUNNEL LINING TROUSE",
    price: "189,000원",
    likeCount: "21794",
    rating: "4.5",
    reviewCount: "330",
    imageUrl:
      "https://www.figma.com/api/mcp/asset/77ef1610-485f-4997-a038-cfa1401622ab",
  },
  {
    id: "sp-4",
    brandName: "51퍼센트",
    productName: "TUNNEL LINING TROUSE",
    price: "189,000원",
    likeCount: "21794",
    rating: "4.5",
    reviewCount: "330",
    imageUrl:
      "https://www.figma.com/api/mcp/asset/14852c22-663c-4584-adbe-172a955cee16",
  },
  {
    id: "sp-5",
    brandName: "51퍼센트",
    productName: "TUNNEL LINING TROUSE",
    price: "189,000원",
    likeCount: "21794",
    rating: "4.5",
    reviewCount: "330",
    imageUrl:
      "https://www.figma.com/api/mcp/asset/cf98a090-cf62-4b57-a299-fac734dc52d5",
  },
  {
    id: "sp-6",
    brandName: "51퍼센트",
    productName: "TUNNEL LINING TROUSE",
    price: "189,000원",
    likeCount: "21794",
    rating: "4.5",
    reviewCount: "330",
    imageUrl:
      "https://www.figma.com/api/mcp/asset/147a3ef4-75e3-4726-bbea-e5bbfd87efd3",
  },
  {
    id: "sp-7",
    brandName: "51퍼센트",
    productName: "TUNNEL LINING TROUSE",
    price: "189,000원",
    likeCount: "21794",
    rating: "4.5",
    reviewCount: "330",
    imageUrl:
      "https://www.figma.com/api/mcp/asset/787fd40c-9f1c-4d5e-b8aa-683c5e0c9523",
  },
  {
    id: "sp-8",
    brandName: "51퍼센트",
    productName: "TUNNEL LINING TROUSE",
    price: "189,000원",
    likeCount: "21794",
    rating: "4.5",
    reviewCount: "330",
    imageUrl:
      "https://www.figma.com/api/mcp/asset/2ecd7e78-7b5e-4e69-8202-035cbeb622f4",
  },
];

function SpecialProductCard({ product }: { product: SpecialProduct }) {
  return (
    <VStack className="w-full" gap={16}>
      <div
        className={cn(
          "aspect-305/407 relative w-[305px] overflow-hidden",
          "max-sm:w-full",
        )}
      >
        <Image
          alt={product.productName}
          className="object-cover"
          fill
          src={product.imageUrl}
        />
        <button
          className="absolute right-3 top-3 z-10 p-1 outline-none"
          type="button"
        >
          <HeartIcon
            className={cn(
              "size-6 transition-colors",
              product.isLiked ? "fill-red-500 text-red-500" : "text-white",
            )}
            strokeWidth={1.5}
          />
        </button>
      </div>
      <Flex className="w-full" direction="column" gap={16}>
        <Flex direction="column" gap={16}>
          <Flex direction="column" gap={10}>
            <span className="text-body-5 font-semibold text-neutral-800">
              {product.brandName}
            </span>
            <p className="text-body-3 font-normal leading-tight text-black">
              {product.productName}
            </p>
          </Flex>
          <span className="text-body-2 max-sm:text-body-3 font-semibold text-black">
            {product.price}
          </span>
        </Flex>

        <HStack gap={10}>
          <HStack align="center" className="text-neutral-400" gap={4}>
            <HeartIcon className="size-4" strokeWidth={1.5} />
            <span className="text-body-4">{product.likeCount}</span>
          </HStack>
          <HStack align="center" className="text-neutral-400" gap={4}>
            <StarIcon className="size-4" strokeWidth={1.5} />
            <span className="text-body-4">
              {product.rating}({product.reviewCount})
            </span>
          </HStack>
        </HStack>
      </Flex>
    </VStack>
  );
}

export function BrandSpecialEvent() {
  return (
    <section className="w-full border-b border-black/10 bg-white py-[100px] max-sm:py-[60px]">
      <div className="max-sm:min-w-auto mx-auto min-w-[1280px] max-w-[1920px] px-4 max-sm:px-5">
        <VStack align="center" className="w-full" gap={50}>
          <h2 className="text-title-2 max-sm:text-title-3 text-center font-bold text-black">
            스페셜 이벤트
          </h2>

          <div
            className={cn(
              "grid w-full max-w-[1280px] grid-cols-4 gap-x-5 gap-y-10",
              "max-sm:grid-cols-2 max-sm:gap-y-5",
            )}
          >
            {SPECIAL_PRODUCTS.map((product) => (
              <SpecialProductCard key={product.id} product={product} />
            ))}
          </div>

          <Button
            className={cn(
              "text-body-2 h-[48px] border-neutral-200 px-[40px] font-semibold",
              "max-sm:w-full",
            )}
            variant="outline"
          >
            더보기
          </Button>
        </VStack>
      </div>
    </section>
  );
}
