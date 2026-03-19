import Image from "next/image";

import type { GetBrandPromotionEventCouponResponse } from "@shared/services/brandPromotion";

import { Flex, cn, VStack } from "@seoul-moment/ui";

interface EventCardProps {
  coupon: GetBrandPromotionEventCouponResponse;
}

export function EventCard({ coupon }: EventCardProps) {
  const isExpired = coupon.status === "EXPIRED";

  return (
    <VStack
      className={cn(
        "relative h-[586px] w-[620px] shrink-0 border border-solid bg-white px-4 py-[30px] transition-all",
        "max-sm:h-auto max-sm:w-[320px]",
        isExpired ? "border-black/10" : "border-black",
      )}
      gap={30}
    >
      <Flex
        align="center"
        className="w-full border-b border-solid border-black/10 pb-5"
        justify="center"
      >
        <h4
          className={cn(
            "text-body-1 text-center font-semibold leading-none",
            isExpired ? "text-black/20" : "text-black",
          )}
        >
          {coupon.title}
        </h4>
      </Flex>
      <VStack align="center" className="w-full" gap={30}>
        <p
          className={cn(
            "text-body-3 text-center leading-none",
            isExpired ? "text-black/20" : "text-black/80",
          )}
        >
          {coupon.description}
        </p>
        <div className="relative h-[386px] w-full border border-solid border-black/10 max-sm:h-[200px]">
          <Image
            alt={coupon.title}
            className={cn("object-cover", isExpired && "opacity-50")}
            fill
            sizes="(max-width: 640px) 320px, 620px"
            src={coupon.imageUrl}
          />
        </div>
      </VStack>
      {isExpired && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/70">
          <div className="relative h-[70px] w-[214px] max-sm:h-[90px] max-sm:w-[180px]">
            <Image
              alt="expired"
              className="object-contain"
              fill
              sizes="(max-width: 640px) 180px, 214px"
              src="/promotion/expired.png"
            />
          </div>
        </div>
      )}
    </VStack>
  );
}
