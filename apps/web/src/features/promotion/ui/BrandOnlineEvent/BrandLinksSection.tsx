import Image from "next/image";

import { VStack, HStack, Button } from "@seoul-moment/ui";

interface BrandLinksSectionProps {
  colorCode: string;
  logoImage: string;
}

export function BrandLinksSection({
  colorCode,
  logoImage,
}: BrandLinksSectionProps) {
  return (
    <VStack
      align="center"
      className="w-full py-[74px] max-sm:px-5 max-sm:py-[50px]"
      gap={50}
      style={{
        backgroundColor: colorCode,
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
      <HStack className="w-full max-w-[413px] max-sm:max-w-full" gap={10}>
        <Button
          className="h-[52px] flex-1 border-black/20 bg-white text-black hover:bg-neutral-50"
          variant="outline"
        >
          브랜드 소개
        </Button>
        <Button
          className="h-[52px] flex-1 border-black/20 bg-white text-black hover:bg-neutral-50"
          variant="outline"
        >
          Shop
        </Button>
      </HStack>
    </VStack>
  );
}
