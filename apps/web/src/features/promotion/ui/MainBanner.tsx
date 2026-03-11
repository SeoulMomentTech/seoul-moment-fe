import Image from "next/image";

import { useMediaQuery } from "@/shared/lib/hooks";
import type { GetBrandPromotionBannerResponse } from "@/shared/services/brandPromotion";

import { cn } from "@seoul-moment/ui";

interface MainBannerProps {
  bannerList: GetBrandPromotionBannerResponse[];
}

export function MainBanner({ bannerList }: MainBannerProps) {
  const isMobile = useMediaQuery("(max-width: 40rem)", false);
  const banner = bannerList?.[0] ?? {};

  return (
    <section
      className={cn(
        "min-w-7xl relative h-[556px] pt-14",
        "max-sm:h-[656px] max-sm:min-w-full",
      )}
    >
      <Image
        alt=""
        className="h-full object-cover"
        height={727}
        priority
        src={isMobile ? banner.mobileImageUrl : banner.imageUrl}
        width={4000}
      />
    </section>
  );
}
