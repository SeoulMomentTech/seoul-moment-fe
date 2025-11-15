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
  const banner = res.data.banner[0];

  return (
    <section
      className={cn(
        "h-[600px] min-w-[1280px] pt-[56px]",
        "max-sm:h-[350px] max-sm:min-w-full",
      )}
    >
      <picture>
        <source
          media="(max-width: 680px)"
          srcSet={banner.mobileImage}
          type="image/webp"
        />
        <source
          media="(max-width: 680px)"
          srcSet={banner.mobileImage}
          type="image/png"
        />
        <BaseImage
          alt=""
          className="h-full object-cover object-top"
          height={600}
          priority
          src={banner.image}
          width={4000}
        />
      </picture>
    </section>
  );
}
