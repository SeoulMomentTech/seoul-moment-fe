"use client";

import Image from "next/image";

import { useMediaQuery } from "@/shared/lib/hooks";

import { VStack, HStack, cn, Flex } from "@seoul-moment/ui";

const LOOKBOOK_IMAGES = {
  top: "https://www.figma.com/api/mcp/asset/f64d5edb-68fb-4d6d-8a07-ee1580ae8ba9",
  pair: [
    {
      id: "pair-1",
      src: "https://www.figma.com/api/mcp/asset/d3b67010-38be-4bf3-b01c-15e0a9d9d31a",
    },
    {
      id: "pair-2",
      src: "https://www.figma.com/api/mcp/asset/b81e3c18-2d5d-4563-ab23-26e1b7ba248c",
    },
  ],
  strip: [
    {
      id: "strip-1",
      src: "https://www.figma.com/api/mcp/asset/70d5835a-d772-4ab3-bbf7-2f1df00d45dd",
    },
    {
      id: "strip-2",
      src: "https://www.figma.com/api/mcp/asset/3e058e7a-4200-4309-abfa-e2dc4387747c",
    },
    {
      id: "strip-3",
      src: "https://www.figma.com/api/mcp/asset/aee33f30-e555-4bd0-8124-25a53f1a7a68",
    },
    {
      id: "strip-4",
      src: "https://www.figma.com/api/mcp/asset/8f793738-5e57-48e1-857c-47ad78851fe0",
    },
    {
      id: "strip-5",
      src: "https://www.figma.com/api/mcp/asset/e5c8bd8d-f6d6-4537-940a-d32bec8e30af",
    },
  ],
  bottom1:
    "https://www.figma.com/api/mcp/asset/f812a727-3100-46a3-983c-67fe41402d8d",
  bottom2:
    "https://www.figma.com/api/mcp/asset/8ff90b13-f020-4fb7-8f6f-a54a77f12a5e",
};

export function BrandLookbook() {
  const isMobile = useMediaQuery("(max-width: 40rem)", false);

  return (
    <section
      className={cn(
        "mx-auto min-w-[1280px] overflow-hidden bg-neutral-50 py-[100px]",
        "max-sm:min-w-auto max-sm:py-[60px]",
      )}
    >
      <VStack align="center" className="w-full" gap={isMobile ? 60 : 100}>
        {/* Top Single Image */}
        <div className="relative h-[944px] w-[630px] max-sm:h-[540px] max-sm:w-full">
          <Image
            alt="Lookbook Top"
            className="object-cover"
            fill
            src={LOOKBOOK_IMAGES.top}
          />
        </div>

        {/* Pair of Images */}
        <div className="max-w-[1064px] px-4 max-sm:w-full max-sm:px-0">
          <HStack gap={isMobile ? 0 : 30}>
            {LOOKBOOK_IMAGES.pair.map((item) => (
              <div
                className="relative h-[644px] w-[517px] flex-1 max-sm:h-[218px]"
                key={item.id}
              >
                <Image
                  alt="Lookbook Pair"
                  className="object-cover"
                  fill
                  src={item.src}
                />
              </div>
            ))}
          </HStack>
        </div>

        {/* Horizontal Strip */}
        <div className="w-full">
          <HStack
            align="center"
            className="mx-auto max-w-[1920px] max-sm:w-full"
            gap={0}
          >
            {LOOKBOOK_IMAGES.strip.map((item) => (
              <div
                className="relative h-[530px] w-full flex-1 max-sm:h-[120px]"
                key={item.id}
              >
                <Image
                  alt="Lookbook Strip"
                  className="object-cover"
                  fill
                  src={item.src}
                />
              </div>
            ))}
          </HStack>
        </div>

        {/* Bottom Section */}
        <VStack
          align="center"
          className="w-full max-w-[1280px] max-sm:items-start"
          gap={isMobile ? 60 : 100}
        >
          <Flex className="w-full">
            <div className="relative h-[644px] w-[847px] max-sm:h-[220px] max-sm:w-[288px]">
              <Image
                alt="Lookbook Bottom 1"
                className="object-cover"
                fill
                src={LOOKBOOK_IMAGES.bottom1}
              />
            </div>
          </Flex>
          <div className="relative h-[680px] w-full max-sm:h-[261px]">
            <Image
              alt="Lookbook Bottom 2"
              className="object-cover"
              fill
              src={LOOKBOOK_IMAGES.bottom2}
            />
          </div>
        </VStack>
      </VStack>
    </section>
  );
}
