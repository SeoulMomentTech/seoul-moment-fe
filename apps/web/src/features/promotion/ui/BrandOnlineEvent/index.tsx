"use client";

import type {
  GetBrandPromotionEventAndCouponResponse,
  GetBrandPromotionNoticsResponse,
} from "@/shared/services/brandPromotion";

import { Flex, cn, VStack } from "@seoul-moment/ui";

import { BrandLinksSection } from "./BrandLinksSection";
import { EventCard, type OnlineEvent } from "./EventCard";
import { NoticeSection } from "./NoticeSection";

const ONLINE_EVENTS: OnlineEvent[] = [
  {
    id: "1",
    title: "Musinsa 25 F/W",
    description:
      "이번 무신사 가을 팝업 이벤트는 25시즌 트랜트에 맞춰 남녀 신상 상품들을 선보인다.",
    imageUrl:
      "https://www.figma.com/api/mcp/asset/7606ee33-a881-448a-b0e1-0bca47ed9e2e",
  },
  {
    id: "2",
    title: "Musinsa 25 F/W",
    description:
      "이번 무신사 가을 팝업 이벤트는 25시즌 트랜트에 맞춰 남녀 신상 상품들을 선보인다.",
    imageUrl:
      "https://www.figma.com/api/mcp/asset/7606ee33-a881-448a-b0e1-0bca47ed9e2e",
    isExpired: true,
  },
];

interface BrandOnlineEventProps {
  eventList: GetBrandPromotionEventAndCouponResponse[];
  noticeList: GetBrandPromotionNoticsResponse[];
  colorCode: string;
  logoImage: string;
}

export function BrandOnlineEvent({
  noticeList,
  colorCode,
  logoImage,
}: BrandOnlineEventProps) {
  return (
    <section className={cn("w-full bg-white")}>
      <VStack
        align="center"
        className={cn(
          "min-w-7xl mx-auto w-full pb-[50px] pt-[140px]",
          "max-sm:min-w-full max-sm:pb-5 max-sm:pt-[50px]",
        )}
        gap={40}
      >
        <h2 className="text-title-2 max-sm:text-title-4 text-center font-bold text-black">
          Musinsa 25 F/W Event
        </h2>

        <div className="no-scrollbar w-full overflow-x-auto max-sm:px-5">
          <Flex
            className="mx-auto w-fit max-sm:w-max max-sm:justify-start"
            gap={10}
            justify="center"
          >
            {ONLINE_EVENTS.map((event) => (
              <EventCard event={event} key={event.id} />
            ))}
          </Flex>
        </div>
      </VStack>
      <NoticeSection noticeList={noticeList} />
      <BrandLinksSection colorCode={colorCode} logoImage={logoImage} />
    </section>
  );
}
