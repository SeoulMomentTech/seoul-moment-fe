"use client";

import { useMediaQuery } from "@/shared/lib/hooks";

import { VStack, cn } from "@seoul-moment/ui";

import { ImageContents } from "./ImageContents";

const LOOKBOOK_IMAGES = {
  top: "https://www.figma.com/api/mcp/asset/f64d5edb-68fb-4d6d-8a07-ee1580ae8ba9",
  pair: [
    "https://www.figma.com/api/mcp/asset/d3b67010-38be-4bf3-b01c-15e0a9d9d31a",
    "https://www.figma.com/api/mcp/asset/b81e3c18-2d5d-4563-ab23-26e1b7ba248c",
  ],
  strip: [
    "https://www.figma.com/api/mcp/asset/70d5835a-d772-4ab3-bbf7-2f1df00d45dd",
    "https://www.figma.com/api/mcp/asset/3e058e7a-4200-4309-abfa-e2dc4387747c",
    "https://www.figma.com/api/mcp/asset/aee33f30-e555-4bd0-8124-25a53f1a7a68",
    "https://www.figma.com/api/mcp/asset/8f793738-5e57-48e1-857c-47ad78851fe0",
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
        <ImageContents imageList={[LOOKBOOK_IMAGES.top]} type={1} />

        {/* Pair of Images */}
        <ImageContents imageList={LOOKBOOK_IMAGES.pair} type={2} />

        {/* Horizontal Strip */}
        <ImageContents imageList={LOOKBOOK_IMAGES.strip} type={3} />

        {/* Bottom Section */}
        <ImageContents imageList={[LOOKBOOK_IMAGES.bottom1]} type={4} />
        <ImageContents imageList={[LOOKBOOK_IMAGES.bottom2]} type={5} />
      </VStack>
    </section>
  );
}
