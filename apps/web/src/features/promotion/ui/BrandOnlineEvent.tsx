"use client";

import Image from "next/image";

import { Flex, cn, VStack } from "@seoul-moment/ui";

interface OnlineEvent {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  isExpired?: boolean;
}

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

const NOTICES = [
  {
    id: "notice-1",
    text: "The 15% coupon is applicable for purchases over USD 200 / THB 6,300 / SGD 250.",
  },
  {
    id: "notice-2",
    text: "Some items may net be eligible for pormo code discounts.",
  },
  {
    id: "notice-3",
    text: "Eligible items for promo codes are subject to change at any time, and restrictions may apply to popular or discounted items.",
  },
  {
    id: "notice-4",
    text: "This event may be changed or terminated without prior notice due to company circumstances.",
  },
];

function EventCard({ event }: { event: OnlineEvent }) {
  return (
    <VStack
      className={cn(
        "relative w-[320px] shrink-0 border border-solid px-[16px] py-[30px] transition-all",
        event.isExpired ? "border-black/10 bg-white" : "border-black bg-white",
      )}
      gap={30}
    >
      <Flex
        align="center"
        className="w-full border-b border-solid border-black/10 pb-[20px]"
        justify="center"
      >
        <h4
          className={cn(
            "text-body-1 text-center font-semibold leading-none",
            event.isExpired ? "text-black/20" : "text-black",
          )}
        >
          {event.title}
        </h4>
      </Flex>
      <VStack align="center" className="w-full" gap={30}>
        <p
          className={cn(
            "text-body-3 text-center leading-none",
            event.isExpired ? "text-black/20" : "text-black/80",
          )}
        >
          {event.description}
        </p>
        <div className="relative h-[200px] w-full border border-solid border-black/10">
          <Image
            alt={event.title}
            className={cn("object-cover", event.isExpired && "opacity-50")}
            fill
            src={event.imageUrl}
          />
        </div>
      </VStack>

      {event.isExpired && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50">
          <div className="flex h-[126px] items-center justify-center rounded-[999px] bg-[#f33e2a] px-[20px]">
            <span className="text-title-3 text-center font-semibold uppercase text-white">
              Expired
            </span>
          </div>
        </div>
      )}
    </VStack>
  );
}

function NoticeSection() {
  return (
    <Flex
      align="flex-start"
      className={cn(
        "w-full bg-neutral-50 py-[40px]",
        "max-lg:w-[1280px]",
        "max-sm:w-full max-sm:px-[20px] max-sm:py-[30px]",
      )}
      direction="column"
    >
      <div
        className={cn("mx-auto flex w-full max-w-[1280px] flex-col gap-[20px]")}
      >
        <p className="text-body-3 font-semibold text-black/80">NOTICE</p>
        <ul className="list-inside list-disc flex-col gap-[12px] pl-2">
          {NOTICES.map((notice) => (
            <li className="gap-[10px]" key={notice.id}>
              <span className="text-body-3 leading-relaxed text-black/40">
                {notice.text}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </Flex>
  );
}

export function BrandOnlineEvent() {
  return (
    <section className={cn("w-full bg-white")}>
      <VStack
        align="center"
        className={cn(
          "mx-auto w-full min-w-[1280px] pb-[50px] pt-[140px]",
          "max-sm:min-w-full max-sm:pb-[20px] max-sm:pt-[50px]",
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

      <NoticeSection />
    </section>
  );
}
