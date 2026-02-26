"use client";

import Image from "next/image";

import { useMediaQuery } from "@shared/lib/hooks";

import { useRouter } from "@/i18n/navigation";

import { Flex, HStack, cn } from "@seoul-moment/ui";

interface Brand {
  id: number;
  name: string;
  imageUrl: string;
}

const BRANDS: Brand[] = [
  {
    id: 1,
    name: "펀프롬펀",
    imageUrl:
      "https://www.figma.com/api/mcp/asset/4ab3bd4d-de24-4a07-8e2c-e68fcf3c6027",
  },
  {
    id: 2,
    name: "무신사스탠다드",
    imageUrl:
      "https://www.figma.com/api/mcp/asset/182f8309-52e6-4652-bbf8-81cc4621d6bc",
  },
  {
    id: 3,
    name: "펀프롬펀",
    imageUrl:
      "https://www.figma.com/api/mcp/asset/b622f1ed-8447-4601-b55d-2443c2bb0b83",
  },
  {
    id: 4,
    name: "론론",
    imageUrl:
      "https://www.figma.com/api/mcp/asset/a22b273c-77e2-4740-a344-c2582275367a",
  },
  {
    id: 7,
    name: "코드그라피",
    imageUrl:
      "https://www.figma.com/api/mcp/asset/cbe40e8a-0888-4d7f-9f8e-158e30b0931e",
  },
  {
    id: 77,
    name: "코드그라피",
    imageUrl:
      "https://www.figma.com/api/mcp/asset/cbe40e8a-0888-4d7f-9f8e-158e30b0931e",
  },
  {
    id: 566,
    name: "코드그라피",
    imageUrl:
      "https://www.figma.com/api/mcp/asset/cbe40e8a-0888-4d7f-9f8e-158e30b0931e",
  },
  {
    id: 5662,
    name: "코드그라피",
    imageUrl:
      "https://www.figma.com/api/mcp/asset/cbe40e8a-0888-4d7f-9f8e-158e30b0931e",
  },
];

interface BrandTabProps {
  selectedId: number;
}

export function BrandTab({ selectedId }: BrandTabProps) {
  const isMobile = useMediaQuery("(max-width: 40rem)", false);
  const navigate = useRouter();

  return (
    <nav className="border-b border-black/10 bg-white">
      <Flex className={cn("mx-auto w-[1280px]", "max-sm:w-full")}>
        <HStack
          align={isMobile ? "start" : "center"}
          className={cn(
            "h-full w-full",
            "no-scrollbar max-sm:justify-start max-sm:gap-5 max-sm:overflow-x-auto max-sm:px-5",
          )}
          gap={isMobile ? 20 : 50}
        >
          {BRANDS.map((brand) => {
            const isActive = brand.id === selectedId;
            return (
              <button
                className={cn(
                  "flex shrink-0 flex-col items-center gap-4 py-5 outline-none transition-all",
                  isActive
                    ? "border-b-2 border-black"
                    : "border-b-2 border-transparent",
                )}
                key={brand.id}
                onClick={() => navigate.push(`/brand/promotion/${brand.id}`)}
                type="button"
              >
                <div className="relative h-[50px] w-[50px] overflow-hidden rounded-full border border-black/10 max-sm:h-[40px] max-sm:w-[40px]">
                  <Image
                    alt={brand.name}
                    className="object-cover"
                    fill
                    src={brand.imageUrl}
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
