import Image from "next/image";

import { VStack, HStack, Button } from "@seoul-moment/ui";

export function BrandLinksSection() {
  const brandLogo =
    "https://www.figma.com/api/mcp/asset/11f97543-c7ee-48b5-9424-0166fef69ff1";

  return (
    <VStack
      align="center"
      className="w-full bg-[#f8c4da] py-[74px] max-sm:px-5 max-sm:py-[50px]"
      gap={50}
    >
      <div className="relative h-[100px] w-[413px] max-sm:h-[68px] max-sm:w-[288px]">
        <Image
          alt="Brand Logo"
          className="object-contain"
          fill
          src={brandLogo}
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
