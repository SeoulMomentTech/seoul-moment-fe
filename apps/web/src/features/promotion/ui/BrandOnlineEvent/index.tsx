"use client";

import type {
  GetBrandPromotionBrandDetailResponse,
  GetBrandPromotionEventAndCouponResponse,
  GetBrandPromotionNoticeResponse,
} from "@shared/services/brandPromotion";

import { Flex, cn, VStack } from "@seoul-moment/ui";

import { BrandLinksSection } from "./BrandLinksSection";
import { EventCard } from "./EventCard";
import { NoticeSection } from "./NoticeSection";

interface BrandOnlineEventProps {
  brand: GetBrandPromotionBrandDetailResponse;
  eventList: GetBrandPromotionEventAndCouponResponse[];
  noticeList: GetBrandPromotionNoticeResponse[];
  colorCode: string;
  logoImage: string;
}

export function BrandOnlineEvent({
  brand,
  noticeList,
  eventList,
  colorCode,
  logoImage,
}: BrandOnlineEventProps) {
  const event = eventList[0];

  return (
    <section className={cn("w-full bg-white")}>
      {event && (
        <VStack
          align="center"
          className={cn(
            "min-w-7xl mx-auto w-full pb-[50px] pt-[140px]",
            "max-sm:min-w-full max-sm:pb-5 max-sm:pt-[50px]",
          )}
          gap={40}
        >
          <h2 className="text-title-2 max-sm:text-title-4 text-center font-bold text-black">
            {event.title}
          </h2>

          <div className="no-scrollbar w-full overflow-x-auto max-sm:px-5">
            <Flex
              className="mx-auto w-fit max-sm:w-max max-sm:justify-start"
              gap={10}
              justify="center"
            >
              {event.couponList.map((coupon) => (
                <EventCard coupon={coupon} key={coupon.id} />
              ))}
            </Flex>
          </div>
        </VStack>
      )}
      {noticeList.length > 0 && <NoticeSection noticeList={noticeList} />}
      <BrandLinksSection
        brand={brand}
        colorCode={colorCode}
        logoImage={logoImage}
      />
    </section>
  );
}
