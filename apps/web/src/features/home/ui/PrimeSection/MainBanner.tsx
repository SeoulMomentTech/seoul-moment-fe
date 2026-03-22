"use client";

import { use } from "react";

import { cn } from "@shared/lib/style";
import type { getHome } from "@shared/services/home";
import { BaseImage } from "@shared/ui/base-image";

interface MainBannerProps {
  promise: ReturnType<typeof getHome>;
}

export function MainBanner({ promise }: MainBannerProps) {
  const res = use(promise);
  const { mobileImage, image } = res.data?.banner?.[0] ?? {};

  if (!image) return null;

  return (
    <section
      className={cn(
        "flex justify-center",
        "min-w-7xl h-[600px] pt-14",
        "max-sm:h-[350px] max-sm:min-w-full",
      )}
    >
      <picture>
        <source
          media="(max-width: 680px)"
          srcSet={mobileImage}
          type="image/webp"
        />
        <source
          media="(max-width: 680px)"
          srcSet={mobileImage}
          type="image/png"
        />
        <BaseImage
          alt=""
          className="h-full object-cover object-top"
          height={600}
          priority
          src={image}
          width={4000}
        />
      </picture>
    </section>
  );
}
